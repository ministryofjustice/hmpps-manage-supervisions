import { WireMockClient } from './wiremock-client'

export interface StubOffenderRisksOptions {
  crn: string
}

export class AssessRisksAndNeedsMockApi {
  constructor(private readonly client: WireMockClient) {}

  async stubPing() {
    await this.client.stubPing('arn')
  }

  async stubOffenderRisks({ crn }: StubOffenderRisksOptions) {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPath: `/arn/risks/crn/${crn}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          id: 'X009923',
          riskToSelf: {
            suicide: {
              risk: 'YES',
              previous: 'YES',
              previousConcernsText: 'lkdlskf;k',
              current: 'YES',
              currentConcernsText: 'fskdkf;lk',
            },
            selfHarm: {
              risk: 'YES',
              previous: 'YES',
              previousConcernsText: 'lkdlskf;k',
              current: 'YES',
              currentConcernsText: 'fskdkf;lk',
            },
            custody: {
              risk: 'YES',
              previous: 'YES',
              previousConcernsText: 'dsjflksdkljfksdj',
              current: 'YES',
              currentConcernsText: 'skjdfkljlksd',
            },
            hostelSetting: {
              risk: 'YES',
              previous: 'YES',
              previousConcernsText: 'dsjflksdkljfksdj',
              current: 'YES',
              currentConcernsText: 'skjdfkljlksd',
            },
            vulnerability: {
              risk: 'YES',
              previous: 'YES',
              previousConcernsText: 'lksdlfkd;lk',
              current: 'YES',
              currentConcernsText: 'jdshfkhskdjhfksd',
            },
          },
          otherRisks: {
            escapeOrAbscond: 'YES',
            controlIssuesDisruptiveBehaviour: 'YES',
            breachOfTrust: 'YES',
            riskToOtherPrisoners: 'YES',
          },
          summary: {
            whoIsAtRisk: 'kjlkj',
            natureOfRisk: 'jjlklkkj',
            riskImminence: 'kjjkjlkj',
            riskIncreaseFactors: 'kjkjlk',
            riskMitigationFactors: 'jbjkhk',
            riskInCommunity: {
              VERY_HIGH: ['Children', 'Staff'],
              HIGH: ['Public'],
              LOW: ['Known Adult'],
            },
            riskInCustody: {
              MEDIUM: ['Children'],
              VERY_HIGH: ['Public', 'Staff'],
              LOW: ['Known Adult'],
              HIGH: ['Prisoners'],
            },
          },
        },
      },
    })
  }
}
