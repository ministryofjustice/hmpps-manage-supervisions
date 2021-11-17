import { ValidationError } from 'class-validator'
import { flattenValidationErrors, FlatValidationError } from './flattenValidationErrors'

describe('flattenValidationErrors', () => {
  it('flattens nested errors', () => {
    const errors: ValidationError[] = [
      {
        property: 'prop1',
        constraints: {
          isBad: 'it is bad',
        },
      },
      {
        property: 'prop2',
        children: [
          {
            property: 'prop3',
            constraints: {
              isNestedBad: 'it is nested bad',
            },
          },
        ],
      },
    ]

    const expected: FlatValidationError[] = [
      { path: 'prop1', constraints: { isBad: 'it is bad' } },
      { path: 'prop2.prop3', constraints: { isNestedBad: 'it is nested bad' } },
    ]

    const observed = flattenValidationErrors(errors)

    expect(observed).toEqual(expected)
  })
})
