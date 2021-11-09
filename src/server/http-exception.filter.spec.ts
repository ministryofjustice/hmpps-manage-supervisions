import { InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { FakeConfigModule } from './config/config.fake'
import { HttpExceptionFilter } from './http-exception.filter'
import { FakeArgumentsHost } from './util/nest.fake'

describe('http exception filter', () => {
  let httpExceptionFilter: HttpExceptionFilter
  const mockRender = jest.fn()
  const host = new FakeArgumentsHost({ response: { status: jest.fn(() => ({ render: mockRender })) } })
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
      imports: [FakeConfigModule.register()],
    }).compile()
    httpExceptionFilter = module.get(HttpExceptionFilter)
  })

  it('renders the not found page when a not found exception occurs', () => {
    httpExceptionFilter.catch(new NotFoundException(), host)
    expect(mockRender).toBeCalledWith('pages/not-found')
  })

  it('renders the unauthorised page when an unauthorised exception occurs', () => {
    httpExceptionFilter.catch(new UnauthorizedException(), host)
    expect(mockRender).toBeCalledWith('pages/unauthorized')
  })

  it('renders the generic error page when an internal server exception occurs', () => {
    httpExceptionFilter.catch(new InternalServerErrorException(), host)
    expect(mockRender).toBeCalledWith('pages/error', expect.objectContaining({ message: 'Internal Server Error' }))
  })
})
