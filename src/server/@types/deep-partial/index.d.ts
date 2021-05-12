import { DateTime } from 'luxon'

type DateTypes = Date | DateTime

declare global {
  /**
   * Same as Partial<T> but goes deeper and makes Partial<T> all its properties and sub-properties.
   */
  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T[P] extends DateTypes
      ? T[P]
      : DeepPartial<T[P]>
  }

  /**
   * Same as DeepPartial<T> but flattens some types out into their json representations e.g. Dates.
   */
  type FlatDeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
      ? Array<FlatDeepPartial<U>>
      : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<FlatDeepPartial<U>>
      : T[P] extends DateTypes
      ? string
      : FlatDeepPartial<T[P]>
  }
}
