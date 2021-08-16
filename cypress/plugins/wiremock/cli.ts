import * as yargs from 'yargs'
import { set } from 'lodash'
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

const { argv } = yargs
  .option('write-mappings', {
    alias: 'w',
    type: 'boolean',
    description: 'write all wiremock mappings to disc instead',
    default: false,
    group: 'global',
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

type SeedOptions = ReferenceDataSeedOptions & OffenderSeedOptions & ContactSeedOptions

async function seed(args: typeof argv) {
  const options: SeedOptions = {}

  if (args['current-conviction'] === false) {
    // null means none in this case
    set(options, 'convictions.active', null)
  }

  if (args['previous-convictions'] === false) {
    set(options, 'convictions.previous', [])
  }

  await wiremocker([reset, referenceDataSeed(options), offenderSeed(options), contactsSeed(options)], {
    writeMappings: args['write-mappings'],
  })
}

seed(argv)
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
