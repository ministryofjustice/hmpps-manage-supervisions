import { OfficeLocation } from '../../src/server/community-api/client'
import { SeedFn } from './wiremock'
import { fakeOfficeLocation } from '../../src/server/community-api/community-api.fake'

export const TEAM_CODE = 'N07UAT'
export const OFFICE_LOCATIONS: OfficeLocation[] = [
  {
    code: 'LDN_MTH',
    description: '117 STOCKWELL ROAD',
    buildingName: 'Moat House',
    buildingNumber: '117',
    streetName: 'Stockwell Road',
    townCity: 'London',
    county: 'Lambeth',
    postcode: 'SW9 9TN',
  },
  {
    code: 'LDN_BCR',
    description: '29/33 VICTORIA ROAD',
    buildingNumber: '29/31',
    streetName: 'Victoria Road',
    townCity: 'Romford',
    county: 'BarkingDag/Havering',
    postcode: 'RM1 2JT',
  },
  {
    code: 'DTVBIS1',
    description: 'Bishop Auckland',
    buildingName: 'Beechburn House',
    buildingNumber: '8',
    streetName: 'Kensington',
    townCity: 'Bishop Auckland',
    county: 'County Durham',
    postcode: 'DL14 6HX',
  },
]

export interface SeedTeamOfficeLocationsOptions {
  teamCode?: string
  officeLocations?: DeepPartial<OfficeLocation>[]
}

export function teamOfficeLocations({
  teamCode = TEAM_CODE,
  officeLocations: partials = OFFICE_LOCATIONS,
}: SeedTeamOfficeLocationsOptions = {}): SeedFn {
  const officeLocations = partials.map(p => fakeOfficeLocation(p))
  return async ({ client }) => {
    await client.community.get(`/secure/teams/${teamCode}/office-locations`).returns(officeLocations)
  }
}
