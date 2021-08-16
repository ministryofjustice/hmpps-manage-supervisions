import axios from 'axios'
import * as path from 'path'
import * as fs from 'fs'
import { promisify } from 'util'
import * as rimraf from 'rimraf'
import { trim } from 'lodash'

const rm = promisify(rimraf)
const wiremockPath = path.resolve(__dirname, '..', '..', '..', 'wiremock')

function urlJoin(...tokens: string[]) {
  const result = tokens
    .map(x => trim(x, '/'))
    .filter(x => x)
    .join('/')
  return !result.startsWith('http') ? `/${result}` : result
}

function getMappingName(
  mapping: Pick<WireMock.StubMapping, 'name' | 'request' | 'response'>,
  filename = false,
): string {
  if (mapping.name) {
    return mapping.name
  }

  const { method, url, urlPath, urlPattern, urlPathPattern, queryParameters } = mapping.request
  const queryTokens = Object.entries(queryParameters || {}).map(([k, v]) => `${k}=${Object.values(v).join()}`)
  const name = [
    url || urlPath || urlPattern || urlPathPattern,
    queryTokens.length === 0 ? '' : '?' + queryTokens.join('&'),
  ].filter(x => x)

  if (filename) {
    return [...name, '.', method.toLowerCase(), '.json'].join('')
  }

  return [...name, '=>', (mapping.response as any).status].join(' ')
}

export interface WiremockClientOptions {
  writeMappings?: boolean
}

export class WiremockClient {
  private static readonly WIREMOCK_URL = process.env.WIRE_MOCK_URL || 'http://localhost:9091'
  private readonly helper: WiremockApiHelper

  constructor({ writeMappings = false }: WiremockClientOptions = {}) {
    this.helper = new WiremockApiHelper(WiremockClient.WIREMOCK_URL, writeMappings)
  }

  setReset(value = true) {
    this.helper.setReset(value)
  }

  async getAllStubs() {
    const mappings = await this.helper.getStubs()
    return mappings.map(x => getMappingName(x))
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

  async commit() {
    await this.helper.commit()
  }
}

class WiremockApiHelper {
  private readonly stubs: WireMock.CreateStubMappingRequest[] = []
  private reset = true

  constructor(public readonly wiremockUrl: string, private readonly writeMappings: boolean) {}

  stub(mapping: WireMock.CreateStubMappingRequest) {
    this.stubs.push(mapping)
  }

  setReset(value: boolean): this {
    this.reset = value
    return this
  }

  async getStubs(): Promise<WireMock.StubMapping[]> {
    if (this.writeMappings) {
      return []
    }
    const { data } = await axios.get<WireMock.GetAllStubMappingsResponse>(this.admin('mappings'))
    return data.mappings
  }

  async getRequests(basePath: string): Promise<WireMock.JournaledRequest[]> {
    if (this.writeMappings) {
      return []
    }
    const url = this.admin('requests')
    const {
      data: { requests },
    } = await axios.get<WireMock.GetAllRequestsResponse>(url)
    return requests.filter(x => x.request.url.startsWith(basePath))
  }

  async commit() {
    if (this.stubs.length === 0) {
      return
    }

    if (this.writeMappings) {
      await rm(path.join(wiremockPath, '**', '*'))
      for (const mapping of this.stubs) {
        const name = path.resolve(wiremockPath, ...getMappingName(mapping, true).split('/'))
        const json = JSON.stringify(mapping, null, 2)
        await fs.promises.mkdir(path.dirname(name), { recursive: true })
        await fs.promises.writeFile(name, json, { encoding: 'utf8' })
      }
    } else {
      if (this.reset) {
        // call reset even if we're setting deleteAllNotInImport to reset request log
        await axios.post(this.admin('reset'))
      }
      await axios.post(this.admin('mappings', 'import'), {
        mappings: this.stubs,
        importOptions: {
          duplicatePolicy: 'IGNORE',
          deleteAllNotInImport: this.reset,
        },
      })
    }

    // remove all stubs
    this.stubs.splice(0, this.stubs.length)
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

  returns(jsonBody: any) {
    this.helper.stub({
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

  notFound() {
    this.helper.stub({
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

  html(htmlBody: string) {
    this.helper.stub({
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

  stubPing() {
    this.get('/health/ping').returns({ status: 'UP' })
  }

  resolveUrl(path: string): string {
    return urlJoin(this.helper.wiremockUrl, this.basePath, path)
  }

  private resolvePath(path: string) {
    return urlJoin(this.basePath, path)
  }
}
