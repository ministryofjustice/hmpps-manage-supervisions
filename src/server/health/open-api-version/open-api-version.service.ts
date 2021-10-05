import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DateTime } from 'luxon'
import { AuthenticationMethod, RestService } from '../../common'
import { Config, DependentApisConfig } from '../../config'
import { OpenApiVersion, OpenApiVersionReport, OpenApiVersionReportSummary } from './open-api-version.types'

interface RemoteApiInfo {
  app: { name: string }
  build: { version: string }
}

@Injectable()
export class OpenApiVersionService {
  private readonly config: DependentApisConfig
  private readonly logger = new Logger()

  constructor(private readonly rest: RestService, config: ConfigService<Config>) {
    this.config = config.get('apis')
  }

  async versionReport(api: keyof DependentApisConfig): Promise<OpenApiVersionReport> {
    const remote = await this.getRemoteVersion(api)
    const local = this.getLocalSpecVersion(api)

    if (!remote || !local) {
      // no need to log this as it will already be logged in the get*Spec functions
      return { result: OpenApiVersionReportSummary.Unknown, isError: true, remote, local }
    }

    if (local.buildNumber > remote.buildNumber) {
      this.logger.error(`the spec used to generate the '${api}' API client is newer than the deployed version`, {
        api,
        local,
        remote,
      })
      return { result: OpenApiVersionReportSummary.BadRemoteVersion, isError: true, remote, local }
    }

    if (local.buildNumber < remote.buildNumber) {
      return { result: OpenApiVersionReportSummary.LocalSpecOutOfDate, isError: false, remote, local }
    }

    return { result: OpenApiVersionReportSummary.Ok, isError: false, remote, local }
  }

  private getLocalSpecVersion(api: keyof DependentApisConfig) {
    try {
      const version = this.config[api].specVersion
      return OpenApiVersionService.parseVersionString(api, version)
    } catch (err) {
      this.logger.error(`failed to get local '${api}' spec`, err)
      return null
    }
  }

  private async getRemoteVersion(api: keyof DependentApisConfig) {
    try {
      const client = this.rest.build(api, null, AuthenticationMethod.None)
      const { data } = await client.get<RemoteApiInfo>('/info')
      return OpenApiVersionService.parseVersionString(api, data.build?.version)
    } catch (err) {
      this.logger.error(`failed to get remote '${api}' spec`, err)
      return null
    }
  }

  /**
   * Standard version strings are 'date.buildNumber.gitSha'
   */
  private static parseVersionString(api: keyof DependentApisConfig, version: string): OpenApiVersion {
    const tokens = version?.split('.')
    if (!tokens || tokens.length !== 3) {
      throw new Error(`cannot determine version of spec '${api}' from '${version}'`)
    }
    const date = DateTime.fromISO(tokens[0])
    const buildNumber = parseInt(tokens[1])
    const gitSha = tokens[2] || null
    if (!date.isValid || isNaN(buildNumber) || !gitSha) {
      throw new Error(`cannot determine version of spec '${api}' from '${version}'`)
    }
    return { date, gitSha, buildNumber }
  }
}
