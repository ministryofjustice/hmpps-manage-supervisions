import { SanitisedResponseError, sanitiseResponseError } from './SanitisedResponseError'

describe('SanitisedResponseError', () => {
  it('it should omit the request headers from the error object ', () => {
    const error = {
      name: '',
      status: 404,
      response: {
        req: {
          method: 'GET',
          url: 'https://test-api/endpoint?active=true',
          headers: {
            property: 'not for logging',
          },
        },
        headers: {
          date: 'Tue, 19 May 2020 15:16:20 GMT',
        },
        status: 404,
        statusText: 'Not found',
        text: 'some-text',
        body: { content: 'hello' },
      },
      message: 'Not Found',
      stack: 'stack description',
    }

    const observed = sanitiseResponseError(error as any)
    expect(observed).toBeInstanceOf(SanitisedResponseError)
    expect(observed.message).toBe(error.message)
    expect(observed.stack).toBe(error.stack)
    expect({ ...observed }).toEqual({
      headers: error.response.headers,
      status: error.response.status,
      text: error.response.text,
      data: error.response.body,
    })
  })

  it('it should return the error message ', () => {
    const error = { message: 'error description' }
    const observed = sanitiseResponseError(error as any)
    expect(observed).toBeInstanceOf(SanitisedResponseError)
    expect(observed.message).toBe(error.message)
  })

  it('it should return an empty object for an unknown error structure', () => {
    const error = { property: 'unknown' }
    const observed = sanitiseResponseError(error as any)
    expect(observed).not.toHaveProperty('property', error.property)
  })
})
