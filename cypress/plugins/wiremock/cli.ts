import * as yargs from 'yargs'
import { set, orderBy } from 'lodash'
import { wiremocker } from './runner'
import {
  reset,
  referenceDataSeed,
  offenderSeed,
  contactsSeed,
  ReferenceDataSeedOptions,
  OffenderSeedOptions,
  ContactSeedOptions,
  casesSeed,
  CasesSeedOptions,
} from '../seeds'
import { WiremockClient } from './wiremock-client'
import { deliusLdap, hmppsAuthStub, Role } from '../hmpps-auth'
import { KebabToCamelCase } from '../../../src/server/app.types'

const { argv } = yargs
  .option('write-mappings', {
    alias: 'w',
    type: 'boolean',
    description: 'write all wiremock mappings to disc instead',
    default: false,
    group: 'global',
  })
  .option('hmpps-auth', {
    type: 'boolean',
    default: false,
    description: 'stub hmpps-auth',
    group: 'security',
  })
  .option('role', {
    type: 'string',
    choices: Object.values(Role),
    default: Role.Write,
    description: 'user role',
    group: 'security',
  })
  .option('get-requests', {
    alias: 'm',
    type: 'string',
    description: 'get mappings for specified url and quit',
    group: 'client',
  })
  .option('caseload', {
    type: 'boolean',
    description: 'the offender is on the caseload',
    default: true,
    group: 'cases',
  })
  .option('current-conviction', {
    alias: 'cc',
    type: 'boolean',
    description: 'stub a current (active) conviction',
    default: true,
    group: 'convictions',
  })
  .option('previous-convictions', {
    alias: 'pc',
    type: 'boolean',
    description: 'stub previous conviction(s)',
    default: true,
    group: 'convictions',
  })
  .option('arn-api-availability', {
    type: 'boolean',
    description: 'is the assess risks & needs api available',
    default: true,
    group: 'risk',
  })
  .option('rosh', {
    type: 'boolean',
    description: 'stub the ROSH assessment from OASys',
    default: true,
    group: 'risk',
  })
  .option('registrations', {
    type: 'boolean',
    description: 'stub the registrations',
    default: true,
    group: 'risk',
  })

type SeedOptions = ReferenceDataSeedOptions & OffenderSeedOptions & ContactSeedOptions & CasesSeedOptions

async function seed(args: KebabToCamelCase<typeof argv>) {
  if (args.getRequests) {
    const client = new WiremockClient()
    const requests = await client.getRequests(args.getRequests)
    const summaries = orderBy(requests, x => x.request.loggedDate).map(x =>
      [
        x.request.loggedDateString,
        x.request.method,
        x.request.url,
        x.request.body,
        JSON.stringify(x.request.headers),
        '=>',
        x.responseDefinition.status,
      ].join(' '),
    )
    for (const summary of summaries) {
      console.log(summary)
    }
    return
  }

  const options: SeedOptions = {}

  if (args.currentConviction === false) {
    // null means none in this case
    set(options, 'convictions.active', null)
  }

  if (args.previousConvictions === false) {
    set(options, 'convictions.previous', [])
  }

  if (args.arnApiAvailability === false) {
    options.risks = 'unavailable'
    options.needs = 'unavailable'
  } else {
    if (args.rosh === false) {
      options.risks = null
    }
  }

  if (args.registrations === false) {
    options.registrations = []
  }

  if (args.caseload === false) {
    options.cases = []
  }

  const modules = [reset, referenceDataSeed(options), offenderSeed(options), contactsSeed(options), casesSeed(options)]
  if (args.hmppsAuth) {
    modules.push(hmppsAuthStub({ role: args.role }))
  } else {
    modules.push(deliusLdap({ role: args.role }))
  }
  await wiremocker(modules, { writeMappings: args.writeMappings })
}

seed(argv as any)
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
