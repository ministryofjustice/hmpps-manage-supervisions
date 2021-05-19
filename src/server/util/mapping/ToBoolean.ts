import { Transform, TransformOptions } from 'class-transformer'

export function ToBoolean(options?: TransformOptions) {
  return Transform(({ value }) => {
    switch (typeof value) {
      case 'boolean':
        return value
      case 'string':
        try {
          return JSON.parse(value.toLowerCase()) === true
        } catch {
          return
        }
      default:
        return
    }
  }, options)
}
