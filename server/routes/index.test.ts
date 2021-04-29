import request from 'supertest'
import appFixture from './testutils/app.fixture'

afterEach(() => {
  jest.resetAllMocks()
})

/**
 * TODO what value do we get from these tests vs the combination of unit + Cyprus tests?
 */
describe('GET /', () => {
  it('should render index page', async () => {
    const app = await appFixture()
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Arrange an appointment')
      })
  })
})
