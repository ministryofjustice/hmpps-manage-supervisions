import axios from 'axios'
import * as path from 'path'
import * as fs from 'fs'
import { promisify } from 'util'
import * as rimraf from 'rimraf'
import { trim } from 'lodash'

const rm = promisify(rimraf)
const wiremockPath = path.resolve(__dirname, '..', '..', '..', 'wiremock')

function urlJoin(...tokens: string[]) {
  let result = tokens
    .map(x => trim(x, '/'))
    .filter(x => x)
    .join('/')

  if (tokens.length > 0 && tokens[tokens.length - 1].endsWith('/')) {
    // special case for preserving a trailing '/'
    result += '/'
  }

  return !result.startsWith('http') ? `/${result}` : result
}

function getUrl({ url, urlPath, urlPattern, urlPathPattern, queryParameters }: WireMock.StubMappingRequest): string {
  const queryTokens = Object.entries(queryParameters || {}).map(([k, v]) => `${k}=${Object.values(v).join()}`)
  return [url || urlPath || urlPattern || urlPathPattern, queryTokens.length === 0 ? '' : '?' + queryTokens.join('&')]
    .filter(x => x)
    .join('')
}

function getMappingName(mapping: Pick<WireMock.StubMapping, 'name' | 'request' | 'response'>): string {
  return (
    mapping.name || [mapping.request.method, getUrl(mapping.request), '=>', (mapping.response as any).status].join(' ')
  )
}

type Mutation = (context: Omit<FluentWiremockContext, 'mutate'>) => void

export type ApiName = 'community' | 'assessRisksAndNeeds'

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

  async getRequests(basePath: string) {
    return this.helper.getRequests(basePath)
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

  /**
   * Registers a mutation for all requests to the specified api that will be run during commit.
   */
  mutate(api: ApiName, mutation: Mutation) {
    const { basePath } = this[api]
    this.helper.addMutation(basePath, mutation)
  }

  async commit() {
    await this.helper.commit()
  }
}

class WiremockApiHelper {
  private readonly mappings: WireMock.CreateStubMappingRequest[] = []
  private readonly mutations: Record<string, Mutation[]> = {}
  private reset = true

  constructor(public readonly wiremockUrl: string, private readonly writeMappings: boolean) {}

  stub(mapping: WireMock.CreateStubMappingRequest) {
    this.mappings.push(mapping)
  }

  setReset(value: boolean) {
    this.reset = value
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

  addMutation(basePath: string, mutation: Mutation) {
    if (!this.mutations[basePath]?.push(mutation)) {
      this.mutations[basePath] = [mutation]
    }
  }

  async commit() {
    if (this.mappings.length === 0) {
      return
    }

    for (const [basePath, mutations] of Object.entries(this.mutations)) {
      const mappings = this.mappings.filter(x => getUrl(x.request).startsWith(`/${basePath}`))
      for (const mutation of mutations) {
        for (const mapping of mappings) {
          const context = new FluentWiremockContext(this, basePath, mapping)
          mutation(context)
        }
      }
    }

    if (this.writeMappings) {
      await rm(path.join(wiremockPath, '**', '*'))
      const name = path.resolve(wiremockPath, 'mappings.json')
      const json = JSON.stringify({ mappings: this.mappings })
      await fs.promises.writeFile(name, json, { encoding: 'utf8' })
    } else {
      if (this.reset) {
        // call reset even if we're setting deleteAllNotInImport to reset request log
        await axios.post(this.admin('reset'))
      }
      await axios.post(this.admin('mappings', 'import'), {
        mappings: this.mappings,
        importOptions: {
          duplicatePolicy: 'IGNORE',
          deleteAllNotInImport: this.reset,
        },
      })
    }

    // remove all stubs
    this.mappings.splice(0, this.mappings.length)
  }

  private admin(...pathTokens: string[]): string {
    return urlJoin(this.wiremockUrl, '__admin', ...pathTokens)
  }
}

class FluentWiremockContext {
  constructor(
    private readonly helper: WiremockApiHelper,
    readonly basePath: string,
    readonly mapping: WireMock.CreateStubMappingRequest = {
      request: { method: 'GET', headers: {} },
      response: { status: 200 },
    },
  ) {}

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

  basicAuth(username: string, password: string): this {
    this.mapping.request.basicAuth = { username, password }
    return this
  }

  bearer(token: string) {
    return this.header('Authorization', `Bearer ${token}`)
  }

  header(key: string, value: string, rule: keyof WireMock.MatchRules = 'equalTo'): this {
    this.mapping.request.headers[key] = { [rule]: value }
    return this
  }

  formBody(data: Record<string, string>): this {
    this.header('Content-Type', 'application/x-www-form-urlencoded')
    this.mapping.request.bodyPatterns = Object.entries(data).map(([k, v]) => ({
      contains: `${k}=${encodeURIComponent(v)}`,
    }))
    return this
  }

  jsonBody(data: any): this {
    this.header('Content-Type', 'application/json')
    this.mapping.request.bodyPatterns = [{ equalToJson: data }]
    return this
  }

  query(query: Record<string, any>, rule: keyof WireMock.MatchRules = 'equalTo'): this {
    this.mapping.request.queryParameters = {
      ...this.mapping.request.queryParameters,
      ...Object.entries(query)
        .map(([k, v]) => ({ [k]: { [rule]: typeof v === 'string' ? v : v.toString() } }))
        .reduce((x, y) => ({ ...x, ...y }), {}),
    }
    return this
  }

  queryMatches(query: Record<string, any>) {
    return this.query(query, 'matches')
  }

  private response(response: WireMock.StubMappingResponse) {
    this.helper.stub({ ...this.mapping, response })
  }

  returns(jsonBody: any) {
    this.response({
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody,
    })
  }

  notFound() {
    this.response({
      status: 404,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { message: 'Not found' },
    })
  }

  html(htmlBody: string) {
    this.response({
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      body: htmlBody,
    })
  }

  emptyOk() {
    this.response({ status: 200 })
  }

  /**
   * Stubs the service ping endpoint.
   * @param strict Stubs the with & without a trailing '/'.
   *               This is needed as some services explicitly call with the trailing '/' & wiremock is overly strict.
   */
  stubPing(strict = false) {
    this.get(strict ? '/health/ping/' : '/health/ping').returns({ status: 'UP' })
  }

  resolveUrl(path: string): string {
    return urlJoin(this.helper.wiremockUrl, this.basePath, path)
  }

  private resolvePath(path: string) {
    return urlJoin(this.basePath, path)
  }
}
