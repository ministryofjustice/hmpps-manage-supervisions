import { Controller, Get, Render } from '../mvc'

export interface CheckSessionViewModel {
  typeOfSession: string
  date: string
  startTime: string
  countsTowardsRAR: boolean
  rarCategory: string
  rarSubCategory: string
  sessionNotes: string
}

@Controller('/arrange-a-session/check')
export class ArrangeASessionController {
  @Get()
  @Render('pages/arrange-a-session/check')
  get(): CheckSessionViewModel {
    return {
      typeOfSession: 'Office visit',
      date: new Date().toUTCString(),
      startTime: '10:00',
      countsTowardsRAR: true,
      rarCategory: 'NPS Accommodation Intervention',
      rarSubCategory: 'NPS Delivered',
      sessionNotes: 'Test notes',
    }
  }
}
