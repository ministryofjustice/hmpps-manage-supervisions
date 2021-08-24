import { map, filter } from 'lodash'
import { NunjucksFilter } from './types'

export class ConcatArrays implements NunjucksFilter {
  filter(...arrays: any[][]): any[] {
    return arrays.reduce((agg, x) => [...agg, ...x], [])
  }
}

export class Map implements NunjucksFilter {
  filter(array: any[], path: string): any[] {
    return map(array, path)
  }
}

export class Filter implements NunjucksFilter {
  filter(array: any[], path: string): any[] {
    return filter(array, path)
  }
}

export class ArrayCoalesce implements NunjucksFilter {
  filter(array: any[], value: any): any {
    if (!array || array.length === 0) {
      return value
    }
    return array
  }
}
