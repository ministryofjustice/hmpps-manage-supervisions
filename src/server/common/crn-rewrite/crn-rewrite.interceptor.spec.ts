import { CallHandler, HttpException, HttpStatus } from '@nestjs/common'
import { fakeExecutionContext } from '../../util/nest.fake'
import { CrnRewriteInterceptor } from './crn-rewrite.interceptor'

describe('CrnRewriteInterceptor', () => {
  let callHandler: CallHandler
  const subject = new CrnRewriteInterceptor()

  beforeEach(async () => {
    callHandler = {
      handle: jest.fn(),
    }
  })

  it('should call next when CRN doesnt need to be capitalised', () => {
    const executionContext = fakeExecutionContext({ request: { params: { crn: 'X12345' } } })

    subject.intercept(executionContext, callHandler)
    expect(callHandler.handle).toBeCalledTimes(1)
  })

  it('should call next when no CRN param present', () => {
    const executionContext = fakeExecutionContext({ request: { url: '/' } })

    subject.intercept(executionContext, callHandler)
    expect(callHandler.handle).toBeCalledTimes(1)
  })

  it('should redirect when CRN needs to be capitalised', () => {
    const executionContext = fakeExecutionContext({
      request: { url: '/case/x12345/overview', params: { crn: 'x12345' } },
    })

    expect(() => subject.intercept(executionContext, callHandler)).toThrow(
      new HttpException({ url: '/case/X12345/overview' }, HttpStatus.MOVED_PERMANENTLY),
    )
  })
})
