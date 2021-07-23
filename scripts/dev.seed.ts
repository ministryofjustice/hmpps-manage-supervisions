import { wiremocker } from '../cypress/plugins/wiremock'
import { reset, referenceDataSeed, offenderSeed, contactsSeed } from '../cypress/plugins/seeds'

async function seed() {
  await wiremocker([reset, referenceDataSeed(), offenderSeed(), contactsSeed()])
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
