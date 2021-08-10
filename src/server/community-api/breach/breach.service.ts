import { Injectable } from '@nestjs/common'
import { CommunityApiService } from '../community-api.service'
import { ContactMappingService } from '../contact-mapping'
import { GetBreachesOptions, GetBreachesResult } from './breach.types'
import { NsiType } from '../well-known'
import { DateTime } from 'luxon'
import { maxBy, minBy, orderBy } from 'lodash'
import { ContactTypeCategory } from '../../config'

@Injectable()
export class BreachService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly contactMapping: ContactMappingService,
  ) {}

  async getBreaches(
    crn: string,
    convictionId: number,
    { includeOutcome = true }: GetBreachesOptions = {},
  ): Promise<GetBreachesResult> {
    // the source of truth for breaches are nsi records of BreachRequest type
    // although these are created to start the breach request rather than the formal breach process.
    // breach requests can actually be withdrawn before court of dismissed by the court.
    // so we need a few extra bits to determine the breach outcome.
    const {
      data: { nsis: breachRequests = [] },
    } = await this.community.breach.getNsiForOffenderByCrnAndConvictionIdUsingGET({
      convictionId,
      crn,
      nsiCodes: [NsiType.BreachRequest],
    })

    // the breach documentation specifies that a start date should be entered when creating a breach request
    // so we can safely ignore all without a start date.
    const startedBreachRequests = breachRequests
      .filter(x => !x.softDeleted && x.actualStartDate)
      .map(x => ({
        ...x,
        active: !x.actualEndDate,
        actualStartDate: DateTime.fromISO(x.actualStartDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
        actualEndDate: x.actualEndDate
          ? DateTime.fromISO(x.actualEndDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
          : null,
      }))

    if (startedBreachRequests.length === 0) {
      return { breaches: [], lastRecentBreachEnd: null }
    }

    // to determine breach end outcome we unfortunately have to go to the contact log.
    // This is actually how Delius works...
    // although Delius considers the contacts the source of truth, we're cheating a bit by using nsi records to filter it.
    // we are being a bit more efficient by getting all breach end contacts at the same time across all completed nsis
    // to do this we need to know the earliest start date and latest end date
    // since contact filtering may be done by datetime, we filter up to the day after the last nsi end date
    const inactiveBreachRequests = startedBreachRequests.filter(x => !x.active)
    const breachOutcomes =
      includeOutcome && inactiveBreachRequests.length > 0
        ? await this.getBreachOutcomesBetween(
            crn,
            convictionId,
            minBy(inactiveBreachRequests, x => x.actualStartDate.toJSDate()).actualStartDate,
            maxBy(inactiveBreachRequests, x => x.actualEndDate.toJSDate()).actualEndDate.plus({ day: 1 }),
          )
        : []

    const breaches = startedBreachRequests.map(nsi => {
      // assumption is made here that breach periods do not overlap ie the first breach end contact that we find is the end of the current breach nsi
      const breachOutcome = nsi.actualEndDate
        ? breachOutcomes.find(x => x.date >= nsi.actualStartDate && x.date <= nsi.actualEndDate)
        : null
      return {
        active: nsi.active,
        startDate: nsi.actualStartDate,
        endDate: nsi.actualEndDate,
        outcome: breachOutcome?.name || nsi.nsiOutcome?.description, // fall back to poor quality outcome field if present
        status: nsi.nsiStatus.description,
      }
    })

    // get the most recent breach end across all breaches that ended within the last 12 months.
    const from = DateTime.now().minus({ years: 1 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    const lastRecentBreachEnd =
      maxBy(
        breaches.filter(x => x.endDate && x.endDate > from),
        x => x.endDate.toJSDate(),
      )?.endDate || null

    return { breaches, lastRecentBreachEnd }
  }

  private async getBreachOutcomesBetween(crn: string, convictionId: number, from: DateTime, to: DateTime) {
    const contactTypes = this.contactMapping.getAllBreachContactTypeCodes()
    const {
      data: { content: breachContacts },
    } = await this.community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET({
      crn,
      convictionId,
      contactDateFrom: from.toISODate(),
      contactDateTo: to.toISODate(),
      page: 0,
      pageSize: 1000,
      contactTypes,
    })

    return orderBy(
      breachContacts
        .map(x => ({
          date: x.contactStart
            ? DateTime.fromISO(x.contactStart).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
            : null,
          ...this.contactMapping.getBreachMeta(x.type.code),
        }))
        .filter(x => x.date && x.type === ContactTypeCategory.BreachEnd),
      x => x.date.toJSDate(),
    )
  }
}
