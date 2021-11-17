import { ValidationError } from 'class-validator'

export interface FlatValidationError {
  path: string
  constraints: Record<string, string>
}

export function flattenValidationErrors(errors: ValidationError[]): FlatValidationError[] {
  const toVisit = [...errors]
  const result: FlatValidationError[] = []
  while (toVisit.length > 0) {
    const error = toVisit.shift()
    if (error.children?.length > 0) {
      toVisit.push(...error.children.map(x => ({ ...x, property: `${error.property}.${x.property}` })))
    }

    if (error.constraints) {
      result.push({ path: error.property, constraints: error.constraints })
    }
  }
  return result
}
