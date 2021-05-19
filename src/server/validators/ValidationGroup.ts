import { ValidationOptions } from 'class-validator'

export function ValidationGroup(
  options: ValidationOptions,
  ...decorators: ((options?: ValidationOptions) => PropertyDecorator)[]
): PropertyDecorator {
  const fns = decorators.map(fn => fn(options))
  return (target, propertyKey) => {
    for (const fn of fns) {
      fn(target, propertyKey)
    }
  }
}
