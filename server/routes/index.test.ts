import request from 'supertest'
import appWithAllRoutes from './testutils/appSetup'

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page', async () => {
    const app = await appWithAllRoutes({})
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Arrange an appointment')
      })
  })
})
