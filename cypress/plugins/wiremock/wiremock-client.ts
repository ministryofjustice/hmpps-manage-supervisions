import axios from 'axios'
import { trim } from 'lodash'

function urlJoin(...tokens: string[]) {
  const result = tokens
    .map(x => trim(x, '/'))
    .filter(x => x)
    .join('/')
  return !result.startsWith('http') ? `/${result}` : result
}

function getQueryString(mapping: WireMock.StubMapping): string {
  const values = Object.entries(mapping.request.queryParameters || {}).map(
    ([k, v]) => `${k}=${Object.values(v).join()}`,
  )
  return values.length === 0 ? '' : '?' + values.join('&')
}

export class WiremockClient {
  private static readonly WIREMOCK_URL = process.env.WIRE_MOCK_URL || 'http://localhost:9091'
  private readonly helper: WiremockApiHelper

  constructor() {
    this.helper = new WiremockApiHelper(WiremockClient.WIREMOCK_URL)
  }

  async reset() {
    await this.helper.reset()
  }

  async getAllStubs() {
    const mappings = await this.helper.getStubs()
    return mappings.map(
      x =>
        `${x.request.method} ${
          x.request.urlPattern || x.request.url || x.request.urlPathPattern || x.request.urlPath
        }${getQueryString(x)} => ${(x.response as any).status}`,
    )
  }

  /**
   * Stubs for the community api on /community-api
   */
  get community(): FluentWiremockContext {
    return new FluentWiremockContext(this.helper, 'community-api')
  }

  /**
   * Stubs for the assess risks & needs api on /assess-risks-and-needs
   */
  get assessRisksAndNeeds(): FluentWiremockContext {
    return new FluentWiremockContext(this.helper, 'assess-risks-and-needs')
  }

  /**
   * Stubs for the HNMPPS auth service on /hmpps-auth
   */
  get hmppsAuth(): FluentWiremockContext {
    return new FluentWiremockContext(this.helper, 'hmpps-auth')
  }
}

class WiremockApiHelper {
  constructor(public readonly wiremockUrl: string) {}

  async reset() {
    await axios.post(this.admin('reset'))
  }

  async stub(mapping: WireMock.CreateStubMappingRequest): Promise<WireMock.StubMapping> {
    const { data } = await axios.post<WireMock.StubMapping>(this.admin('mappings'), mapping)
    return data
  }

  async getStubs(): Promise<WireMock.StubMapping[]> {
    const { data } = await axios.get<WireMock.GetAllStubMappingsResponse>(this.admin('mappings'))
    return data.mappings
  }

  async getRequests(basePath: string): Promise<WireMock.JournaledRequest[]> {
    const url = this.admin('requests')
    const {
      data: { requests },
    } = await axios.get<WireMock.GetAllRequestsResponse>(url)
    return requests.filter(x => x.request.url.startsWith(basePath))
  }

  private admin(...pathTokens: string[]): string {
    return urlJoin(this.wiremockUrl, '__admin', ...pathTokens)
  }
}

class FluentWiremockContext {
  private mapping: WireMock.CreateStubMappingRequest = { request: { method: 'GET' }, response: { status: 200 } }

  constructor(private readonly helper: WiremockApiHelper, private readonly basePath: string) {}

  async getRequests(path: string) {
    return this.helper.getRequests(this.resolvePath(path))
  }

  priority(priority: number): this {
    this.mapping.priority = priority
    return this
  }

  get(path: string): this {
    this.mapping.request.method = 'GET'
    this.mapping.request.urlPath = this.resolvePath(path)
    return this
  }

  post(path: string): this {
    this.mapping.request.method = 'POST'
    this.mapping.request.urlPath = this.resolvePath(path)
    return this
  }

  query(query: Record<string, any>, comparison: 'matches' | 'equalTo' = 'equalTo'): this {
    this.mapping.request.queryParameters = {
      ...this.mapping.request.queryParameters,
      ...Object.entries(query)
        .map(([k, v]) => ({ [k]: { [comparison]: typeof v === 'string' ? v : v.toString() } }))
        .reduce((x, y) => ({ ...x, ...y }), {}),
    }
    return this
  }

  queryMatches(query: Record<string, any>) {
    return this.query(query, 'matches')
  }

  async returns(jsonBody: any) {
    return await this.helper.stub({
      ...this.mapping,
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody,
      },
    })
  }

  async notFound() {
    return await this.helper.stub({
      ...this.mapping,
      response: {
        status: 404,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { message: 'Not found' },
      },
    })
  }

  async html(htmlBody: string) {
    return await this.helper.stub({
      ...this.mapping,
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: htmlBody,
      },
    })
  }

  async stubPing() {
    await this.get('/health/ping').returns({ status: 'UP' })
  }

  resolveUrl(path: string): string {
    return urlJoin(this.helper.wiremockUrl, this.basePath, path)
  }

  private resolvePath(path: string) {
    return urlJoin(this.basePath, path)
  }
}
