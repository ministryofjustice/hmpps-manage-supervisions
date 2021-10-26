export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface MatchRules {
  equalTo?: string
  matches?: string
}

export interface StubMappingRequest {
  /**
   * The HTTP request method e.g. GET.
   */
  method: HttpMethod

  /**
   * The path and query to match exactly against.
   * Only one of url, urlPattern, urlPath or urlPathPattern may be specified.
   */
  url?: string

  /**
   * The path to match exactly against.
   * Only one of url, urlPattern, urlPath or urlPathPattern may be specified.
   */
  urlPath?: string

  /**
   * The path regex to match against.
   * Only one of url, urlPattern, urlPath or urlPathPattern may be specified.
   */
  urlPathPattern?: string

  /**
   * The path and query regex to match against.
   * Only one of url, urlPattern, urlPath or urlPathPattern may be specified.
   */
  urlPattern?: string

  /**
   * Query parameter patterns to match against.
   */
  queryParameters?: Record<string, MatchRules>

  /**
   * Header patterns to match against.
   */
  headers?: Record<string, MatchRules>

  /**
   * Pre-emptive basic auth credentials to match against.
   */
  basicAuth?: {
    username: string
    password: string
  }

  /**
   * Cookie patterns to match against.
   */
  cookies?: Record<string, string>

  /**
   * Request body patterns to match against.
   */
  bodyPatterns?: Record<string, any>[]
}

export interface StubMappingResponse {
  /**
   * The HTTP status code to be returned.
   */
  status: number

  /**
   * The HTTP status message to be returned.
   */
  statusMessage?: string

  /**
   * Map of response headers to send.
   */
  headers?: Record<string, string>

  /**
   * Extra request headers to send when proxying to another host.
   */
  additionalProxyRequestHeaders?: Record<string, string>

  /**
   * The response body as a string.
   * Only one of body, base64Body, jsonBody or bodyFileName may be specified.
   */
  body?: string

  /**
   * The response body as a base64 encoded string (useful for binary content).
   * Only one of body, base64Body, jsonBody or bodyFileName may be specified.
   */
  base64Body?: string

  /**
   * The response body as a JSON object.
   * Only one of body, base64Body, jsonBody or bodyFileName may be specified.
   */
  jsonBody?: any

  /**
   * The path to the file containing the response body, relative to the configured file root.
   * Only one of body, base64Body, jsonBody or bodyFileName may be specified.
   */
  bodyFileName?: string

  /**
   * The fault to apply (instead of a full, valid response).
   */
  fault?: 'CONNECTION_RESET_BY_PEER' | 'EMPTY_RESPONSE' | 'MALFORMED_RESPONSE_CHUNK' | 'RANDOM_DATA_THEN_CLOSE'

  /**
   * Number of milliseconds to delay be before sending the response.
   */
  fixedDelayMilliseconds?: number

  /**
   * Read-only flag indicating false if this was the default, unmatched response. Not present otherwise.
   */
  fromConfiguredStub?: boolean

  /**
   * The base URL of the target to proxy matching requests to.
   */
  proxyBaseUrl?: string

  /**
   * Parameters to apply to response transformers.
   */
  transformerParameters?: Record<string, string>

  /**
   * List of names of transformers to apply to this response.
   */
  transformers?: string[]
}

export interface StubMapping {
  /**
   * This stub mapping's unique identifier
   */
  id: string

  /**
   * Alias for the id
   */
  uuid: string

  /**
   * The stub mapping's name
   */
  name?: string

  request: StubMappingRequest

  response: StubMappingResponse

  /**
   * Indicates that the stub mapping should be persisted immediately on create/update/delete and survive resets to default.
   */
  persistent: boolean

  /**
   * This stub mapping's priority relative to others. 1 is highest.
   */
  priority: number

  /**
   * The name of the scenario that this stub mapping is part of
   */
  scenarioName: string

  /**
   * The required state of the scenario in order for this stub to be matched.
   */
  requiredScenarioState: string

  /**
   * The new state for the scenario to be updated to after this stub is served.
   */
  newScenarioState: string

  /**
   * A map of the names of post serve action extensions to trigger and their parameters.
   */
  postServeActions: any

  /**
   * Arbitrary metadata to be used for e.g. tagging, documentation. Can also be used to find and remove stubs.
   */
  metadata: any
}

export interface GetAllStubMappingsResponse {
  mappings: StubMapping[]
  meta: {
    total: number
  }
}

export type CreateStubMappingRequest = Partial<StubMapping> & Pick<StubMapping, 'request' | 'response'>

export interface JournaledRequest {
  id: string
  request: {
    url: string
    absoluteUrl: string
    method: HttpMethod
    clientIp: string
    headers: Record<string, string>
    cookies: Record<string, string>
    browserProxyRequest: boolean
    loggedDate: number
    bodyAsBase64: string
    body: string
    loggedDateString: string
    queryParams: Record<string, { key: string; values: string[] }>
  }
  responseDefinition: {
    status: number
    transformers: string[]
    fromConfiguredStub: boolean
    transformerParameters: Record<string, string>
  }
}

export interface GetAllRequestsResponse {
  requests: JournaledRequest[]
  meta: { total: number }
  requestJournalDisabled: boolean
}
