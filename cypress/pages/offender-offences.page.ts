import { SummaryList, SummaryListCallback } from './components/summary-list'
import { PageBase } from './page'

export class OffenderOffencesPage extends PageBase {
  mainOffence(callback: SummaryListCallback) {
    SummaryList.selectFromCard('Main offence', callback)
  }
  additionalOffence(code: string, callback: SummaryListCallback) {
    SummaryList.selectFromCard(`Additional offence (${code})`, callback)
  }
}
