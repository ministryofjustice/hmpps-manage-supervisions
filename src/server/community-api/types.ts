export interface Paginated<T> {
  content: T[]
  size: number
  number: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}
