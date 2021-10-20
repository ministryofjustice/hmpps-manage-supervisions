import { NunjucksFilter } from './types'
import { quantity, QuantityOptions } from '../../../util'

export class Quantity extends NunjucksFilter {
  filter(value: number, units: string, options?: QuantityOptions): any {
    if (typeof value !== 'number' || typeof units !== 'string') {
      throw new Error('must provide a number & unit')
    }
    return quantity(value, units, options)
  }
}
