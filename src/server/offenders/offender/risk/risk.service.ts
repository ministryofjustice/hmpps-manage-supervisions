import { Injectable } from '@nestjs/common'
import { map, reduce, forEach } from 'lodash'
import { CommunityApiService } from '../../../community-api'
import { AssessRisksAndNeedsApiService } from '../../../assess-risks-and-needs-api'
import { RegistrationFlag, Risks, RoshRisk } from './risk.types'
import { ConfigService } from '@nestjs/config'
import { Config, RiskConfig } from '../../../config'

@Injectable()
export class RiskService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly assessRisksAndNeeds: AssessRisksAndNeedsApiService,
    private readonly config: ConfigService<Config>,
  ) {}

  async getRisks(crn: string): Promise<Risks> {
    const response = await this.assessRisksAndNeeds.risk.getRoshRisksByCrn(
      {
        crn,
      },
      {
        validateStatus: (status: number) => (status >= 200 && status < 300) || status === 404,
      },
    )

    if (response.status === 404) {
      return {}
    }

    const communityRisks = invertRiskMap(response.data.summary.riskInCommunity)

    const overallLevel = communityRisks.reduce((agg, risk) => {
      if (Object.keys(knownRiskLevels).indexOf(risk.level.key) > Object.keys(knownRiskLevels).indexOf(agg.level.key)) {
        return risk
      } else {
        return agg
      }
    }).level

    return {
      overallLevel: overallLevel,
      communityRisks,
    }
  }

  async getRiskRegistrations(crn: string): Promise<RegistrationFlag[]> {
    const {
      data: { registrations },
    } = await this.community.risks.getOffenderRegistrationsByCrnUsingGET({ crn, activeOnly: true })

    if (!registrations) {
      return []
    }

    const { ignoredRegistrationTypes } = this.config.get<RiskConfig>('risk')
    return registrations
      .filter(x => !ignoredRegistrationTypes.includes(x.type.code))
      .map(r => {
        return {
          text: r.type.description,
          class: `govuk-tag--${mapDeliusRegistrationColour(r.riskColour)}`,
        }
      })
      .sort((a, b) => a.text.localeCompare(b.text))
  }
}

function invertRiskMap(obj: { [key: string]: Array<string> }): RoshRisk[] {
  return map(
    reduce(
      obj,
      (result, values, key) => {
        forEach(values, value => {
          result[value] = key
        })
        return result
      },
      {},
    ),
    (level, key) => {
      return { riskTo: key, level: knownRiskLevels[level] }
    },
  )
}

function mapDeliusRegistrationColour(deliusColour: string): string {
  switch (deliusColour.toLowerCase()) {
    case 'red':
      return 'red'
    case 'amber':
      return 'orange'
    case 'green':
      return 'green'
    case 'white':
      return 'grey'
    default:
      return 'grey'
  }
}

const knownRiskLevels = {
  LOW: { key: 'LOW', class: 'govuk-tag--green', text: 'LOW' },
  MEDIUM: { key: 'MEDIUM', class: 'govuk-tag--yellow', text: 'MEDIUM' },
  HIGH: { key: 'HIGH', class: 'govuk-tag--red', text: 'HIGH' },
  VERY_HIGH: { key: 'VERY_HIGH', class: 'app-tag--dark-red', text: 'VERY HIGH' },
}
