import { ContactDto } from '../../src/server/delius-api/client'
import { SeedFn } from './wiremock'
import { fakeContactDto } from '../../src/server/delius-api/delius-api.fake'
import { DeepPartial } from '../../src/server/app.types'

const CONTACT_DTO: DeepPartial<ContactDto>[] = [
  {
    id: 5,
    notes: 'Some updated notes',
    outcome: 'DNA1',
  },
  { id: 4 }, // used for enforcement update
]

export function deliusApiContact(partials: DeepPartial<ContactDto>[] = CONTACT_DTO): SeedFn {
  return context => {
    const contacts = partials.map(c => fakeContactDto(c))

    contacts.forEach(c => {
      const url = `/v1/contact/${c.id}`
      context.client.delius
        .patch(url)
        .priority(2)
        .returns(c as ContactDto)
    })
  }
}
