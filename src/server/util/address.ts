import { Address } from '../community-api'

export function getAddressLines(address: Address) {
  if (address.noFixedAbode) {
    return ['No fixed abode', address.type.description]
  }

  return [
    [address.addressNumber, address.buildingName, address.streetName].filter(x => x).join(' '),
    address.district,
    address.town,
    address.county,
    address.postcode,
  ].filter(x => x)
}
