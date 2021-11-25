import { map, filter } from 'lodash'
import { NunjucksFilter } from './types'

export class ConcatArrays extends NunjucksFilter {
  filter(...arrays: any[][]): any[] {
    return arrays.filter(x => x?.length > 0).reduce((agg, x) => [...agg, ...x], [])
  }
}

export class Map extends NunjucksFilter {
  filter(array: any[], path: string): any[] {
    return map(array, path)
  }
}

export class Filter extends NunjucksFilter {
  filter(array: any[], path: string): any[] {
    return filter(array, path)
  }
}

export class ArrayCoalesce extends NunjucksFilter {
  filter(array: any[], value: any): any {
    if (!array || array.length === 0) {
      return value
    }
    return array
  }
}

export class SortBy extends NunjucksFilter {
  filter(array: any[], by: string): any[] {
    return array.sort((x, y) => x[by].localeCompare(y[by]))
  }
}
