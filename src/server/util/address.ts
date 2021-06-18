import { Address } from '../community-api'

export function getAddressLines(address: Address) {
  return [
    [address.addressNumber, address.buildingName, address.streetName].filter(x => x).join(' '),
    address.town,
    address.county,
    address.postcode,
  ].filter(x => x)
}
