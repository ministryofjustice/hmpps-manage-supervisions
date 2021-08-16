import { PersonalContact } from '../../src/server/community-api/client'
import { SeedFn } from './wiremock'
import { fakePersonalContact } from '../../src/server/community-api/community-api.fake'

export const PERSONAL_CONTACTS: DeepPartial<PersonalContact>[] = [
  {
    relationship: 'Wife',
    startDate: '2019-09-13T00:00:00',
    title: 'Dr',
    firstName: 'Pippa',
    surname: 'Wade',
    gender: 'Female',
    relationshipType: { description: 'Next of Kin' },
    notes: 'Divorced',
    address: {
      addressNumber: '64',
      buildingName: null,
      streetName: 'Ermin Street',
      town: 'Wrenthorpe',
      county: 'West Yorkshire',
      postcode: 'WF2 8WT',
      telephoneNumber: '07073735801',
    },
    mobileNumber: '07700 900 141',
    createdDatetime: '2019-09-13T00:00:00',
    lastUpdatedDatetime: '2019-09-13T00:00:00',
  },
  {
    relationship: 'Father',
    startDate: '2019-09-13T00:00:00',
    title: 'Mr',
    firstName: 'Jonathon',
    surname: 'Bacon',
    gender: 'Male',
    relationshipType: { description: 'Family member' },
    createdDatetime: '2019-09-13T00:00:00',
    lastUpdatedDatetime: '2019-09-13T00:00:00',
  },
]

export function personalContacts(crn: string, partials: DeepPartial<PersonalContact>[] = PERSONAL_CONTACTS): SeedFn {
  return context => {
    const personalContacts = partials.map(p => fakePersonalContact(p))
    context.client.community.get(`/secure/offenders/crn/${crn}/personalContacts`).returns(personalContacts)
  }
}
