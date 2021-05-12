import { HttpExceptionFilter } from './http-exception.filter'

describe('ErrorFilter', () => {
  it('should be defined', () => {
    expect(new HttpExceptionFilter()).toBeDefined()
  })
})
