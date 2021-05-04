import * as superagent from 'superagent'
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

  async stub(mapping: WireMock.CreateStubMappingRequest): Promise<WireMock.StubMapping> {
    const response = await superagent.post(WireMockClient.admin('mappings')).send(mapping)
    return response.body as WireMock.StubMapping
  }

  async getRequests(basePath: string): Promise<WireMock.JournaledRequest[]> {
    const response = await superagent.get(WireMockClient.admin('requests'))
    const { requests } = response.body as WireMock.GetAllRequestsResponse
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
    await Promise.all([
      superagent.delete(WireMockClient.admin('mappings')),
      superagent.delete(WireMockClient.admin('requests')),
    ])
  }
}
