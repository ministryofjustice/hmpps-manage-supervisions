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
} from '../seeds'
import { WiremockClient } from './wiremock-client'
import { hmppsAuthStub } from '../hmpps-auth'

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
  })
  .option('get-requests', {
    alias: 'm',
    type: 'string',
    description: 'get mappings for specified url and quit',
    group: 'client',
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
  .option('rosh', {
    type: 'boolean',
    description: 'stub the ROSH assessment from OASys',
    default: true,
    group: 'risk',
  })

type SeedOptions = ReferenceDataSeedOptions & OffenderSeedOptions & ContactSeedOptions

type KebabToCamelCase<T extends string> = T extends `${infer L}-${infer R}`
  ? `${Lowercase<L>}${Capitalize<KebabToCamelCase<R>>}`
  : Lowercase<T>

/**
 * yargs camelCases all kebab case properties but fails to type them.
 */
type CamelCased<T> = { [K in keyof T as K extends string ? KebabToCamelCase<K> : K]: T[K] }

async function seed(args: CamelCased<typeof argv>) {
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

  if (args.rosh === false) {
    options.risks = null
  }

  const modules = [reset, referenceDataSeed(options), offenderSeed(options), contactsSeed(options)]
  if (args.hmppsAuth) {
    modules.push(hmppsAuthStub())
  }
  await wiremocker(modules, { writeMappings: args.writeMappings })
}

seed(argv as any)
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
