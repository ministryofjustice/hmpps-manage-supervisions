import { registerDecorator, ValidationOptions, isIn, buildMessage } from 'class-validator'

export const IS_IN_FN = 'isInFn'

export function IsInFn(fn: (obj: any) => any[], options?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: IS_IN_FN,
      target: object.constructor,
      propertyName,
      constraints: [fn],
      options,
      validator: {
        validate(value, args) {
          const [fn] = args.constraints
          const values = fn(args.object as any)
          return isIn(value, values)
        },
        defaultMessage: buildMessage((eachPrefix, args) => {
          const [fn] = args.constraints
          const values = fn(args.object as any)
          return `${eachPrefix}$property must be one of the following values: ${values.join(', ')}`
        }, options),
      },
    })
  }
}
