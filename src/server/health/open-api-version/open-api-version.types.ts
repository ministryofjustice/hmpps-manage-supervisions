import { DateTime } from 'luxon'

export interface OpenApiVersion {
  gitSha: string
  date: DateTime
  buildNumber: number
}

export enum OpenApiVersionReportSummary {
  Ok = 'ok',
  Unknown = 'unknown',
  LocalSpecOutOfDate = 'local-spec-out-of-date',
  BadRemoteVersion = 'bad-remote-version',
}

export interface OpenApiVersionReport {
  isError: boolean
  result: OpenApiVersionReportSummary
  local?: OpenApiVersion
  remote?: OpenApiVersion
}
