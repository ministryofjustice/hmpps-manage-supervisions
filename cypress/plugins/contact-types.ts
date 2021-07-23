import { SeedFn } from './wiremock'

const CONTACT_TYPES = [
  {
    code: 'CT3A',
    description: 'Phone Contact from Other',
    appointment: false,
  },
  {
    code: 'CT3B',
    description: 'Phone Contact to Other',
    appointment: false,
  },
  {
    code: 'CTOA',
    description: 'Phone Contact from Offender',
    appointment: false,
  },
  {
    code: 'CTOB',
    description: 'Phone Contact to Offender',
    appointment: false,
  },
  {
    code: 'CM3A',
    description: 'eMail/Text from Other',
    appointment: false,
  },
  {
    code: 'CMOA',
    description: 'eMail/Text from Offender',
    appointment: false,
  },
  {
    code: 'CMOB',
    description: 'eMail/Text to Offender',
    appointment: false,
  },
  {
    code: 'NOT_WELL_KNOWN_COMMUNICATION',
    description: 'A not well know communication type',
    appointment: false,
  },
]

export const contactTypes: SeedFn = async context => {
  await context.client.community.get('/secure/contact-types').query({ categories: 'LT' }).returns(CONTACT_TYPES)
}
