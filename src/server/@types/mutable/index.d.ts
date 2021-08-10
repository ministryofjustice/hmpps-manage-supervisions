/**
 * Strips all readonly modifiers from the specified type.
 * This is useful for the open-api models who for some reason use readonly everywhere.
 */
export type Mutable<T> = {
  -readonly [K in keyof T]: T[K]
}
