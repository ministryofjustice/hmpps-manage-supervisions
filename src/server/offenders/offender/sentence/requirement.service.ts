import { Injectable, Logger } from '@nestjs/common'
import { Requirement } from '../../../community-api/client'
import { Duration, DurationUnit } from 'luxon'
import {
  ConvictionRequirement,
  ConvictionRequirementDetail,
  ConvictionRequirementType,
  GetConvictionRequirementsOptions,
} from './sentence.types'
import { getPotentiallyExpectedDateTime, quantity } from '../../../util'
import { groupBy, trimEnd } from 'lodash'
import { ConfigService } from '@nestjs/config'
import { Config, getWellKnownRequirementName, isRar, WellKnownRequirementTypeConfig } from '../../../config'
import { CommunityApiService } from '../../../community-api'

@Injectable()
export class RequirementService {
  private readonly logger = new Logger(RequirementService.name)
  private readonly config: WellKnownRequirementTypeConfig

  constructor(private readonly community: CommunityApiService, config: ConfigService<Config>) {
    this.config = config.get('requirements')
  }

  async getConvictionRequirements(options: GetConvictionRequirementsOptions): Promise<ConvictionRequirement[]> {
    const { data } = await this.community.requirement.getRequirementsByConvictionIdUsingGET(options)
    const requirements = data.requirements?.filter(x => !x.softDeleted) || []

    if (requirements.length === 0) {
      return []
    }

    // extract rar requirements first as they must be merged
    const groups = groupBy(requirements, r => (isRar(this.config, r) ? 'rar' : ConvictionRequirementType.Unit))

    const result: ConvictionRequirement[] =
      groups[ConvictionRequirementType.Unit]?.map(r => ({
        type: ConvictionRequirementType.Unit,
        name: getWellKnownRequirementName(this.config, r),
        isRar: false,
        ...this.getRequirementDetail(r),
      })) || []

    if (groups['rar']) {
      result.unshift(this.aggregateRar(groups['rar']))
    }

    return result
  }

  private aggregateRar(requirements: Requirement[]): ConvictionRequirement | null {
    if (requirements.length === 0) {
      return null
    }

    if (requirements.length === 1) {
      const [requirement] = requirements
      return {
        type: ConvictionRequirementType.Unit,
        name: getWellKnownRequirementName(this.config, requirement),
        isRar: true,
        ...this.getRequirementDetail(requirement),
      }
    }

    const { length, progress } = requirements
      .map(r => ({
        length: this.transformUnits(r.length || 0, r.lengthUnit || 'days', 'days'),
        progress: r.rarCount || 0,
      }))
      .reduce((x, y) => ({ length: x.length + y.length, progress: x.progress + y.progress }))

    return {
      type: ConvictionRequirementType.Aggregate,
      name: [
        `${quantity(length, 'days')} RAR,`,
        `${progress === 0 ? 'none' : progress} completed`,
        `(${requirements.length} requirements)`,
      ].join(' '),
      isRar: true,
      requirements: requirements.map(r => this.getRequirementDetail(r)),
    }
  }

  private transformUnits(value: number, units: string, targetUnits: DurationUnit): number {
    if (targetUnits === units) {
      // short circuit
      return value
    }

    units = trimEnd(units.trim().toLowerCase(), 's')
    if (trimEnd(targetUnits, 's') === units) {
      return value
    }

    // got to transform
    try {
      return Math.floor(Duration.fromObject({ [units]: value }).as(targetUnits))
    } catch (err) {
      this.logger.error(`Cannot convert '${value}' from '${units}' to '${targetUnits}'`, err)
      return 0
    }
  }

  private getRequirementDetail(req: Requirement): ConvictionRequirementDetail {
    return {
      length: quantity(req.length, req.lengthUnit),
      notes: req.requirementNotes,
      startDate: getPotentiallyExpectedDateTime(req.startDate, req.expectedStartDate),
      endDate: getPotentiallyExpectedDateTime(req.terminationDate, req.expectedEndDate),
      terminationReason: req.terminationReason?.description,
      progress: isRar(this.config, req) ? `${quantity(req.rarCount || 0, 'days')} completed` : null,
    }
  }
}
