import axios from 'axios'
import { trim } from 'lodash'

export class WireMockClient {
  public static readonly WIRE_MOCK_URL = process.env.WIRE_MOCK_URL || 'http://localhost:9091'

  static urlJoin(hostOrRootPath: string, ...pathTokens: string[]): string {
    const result = [hostOrRootPath, ...pathTokens]
      .map(x => trim(x, '/'))
      .filter(x => x)
      .join('/')
    return !result.startsWith('http') ? `/${result}` : result
  }

  private static admin(...pathTokens: string[]): string {
    return this.urlJoin(this.WIRE_MOCK_URL, '__admin', ...pathTokens)
  }

  private static async deleteAll(entity: string) {
    const url = WireMockClient.admin(entity)
    WireMockClient.log('DELETE', url)
    await axios.delete(WireMockClient.admin(entity))
  }

  private static log(method: string, url: string, body?: any) {
    if (process.env.DEBUG?.includes('WIREMOCK_CLIENT')) {
      console.log(`${method} ${url} ${body ? JSON.stringify(body) : ''}`)
    }
  }

  async stub(mapping: WireMock.CreateStubMappingRequest): Promise<WireMock.StubMapping> {
    const url = WireMockClient.admin('mappings')
    WireMockClient.log('POST', url, mapping)
    const response = await axios.post<WireMock.StubMapping>(url, mapping)
    return response.data
  }

  async getRequests(basePath: string): Promise<WireMock.JournaledRequest[]> {
    const url = WireMockClient.admin('requests')
    const {
      data: { requests },
    } = await axios.get<WireMock.GetAllRequestsResponse>(url)
    return requests.filter(x => x.request.url.startsWith(basePath))
  }

  async stubFavicon() {
    return this.stub({
      request: {
        method: 'GET',
        urlPattern: '/favicon.ico',
      },
      response: {
        status: 200,
      },
    })
  }

  async stubPing(basePath: string) {
    return this.stub({
      request: {
        method: 'GET',
        urlPattern: WireMockClient.urlJoin(basePath, '/health/ping'),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: 'UP' },
      },
    })
  }

  async reset() {
    await Promise.all([WireMockClient.deleteAll('mappings'), WireMockClient.deleteAll('requests')])
  }
}
