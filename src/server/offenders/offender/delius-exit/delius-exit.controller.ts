import { Controller, Get, Param, Render } from '@nestjs/common'
import { OffenderService } from '../offender.service'
import { DeliusExitViewModel } from './delius-exit.types'
import { SentenceService } from '../sentence'
import { ConfigService } from '@nestjs/config'
import { Config, DeliusConfig } from '../../../config'

@Controller('offender/:crn(\\w+)/to-delius')
export class DeliusExitController {
  constructor(
    private readonly offender: OffenderService,
    private readonly sentence: SentenceService,
    private readonly config: ConfigService<Config>,
  ) {}

  @Get('/')
  @Render('offenders/offender/to-delius/to-delius')
  async getDeliusExit(@Param('crn') crn: string): Promise<DeliusExitViewModel> {
    const [offender, convictionId] = await Promise.all([
      this.offender.getOffenderDetail(crn),
      this.sentence.getConvictionId(crn),
    ])
    return {
      exitLink: new URL(
        `/NDelius-war/delius/JSP/deeplink.jsp?component=ContactList&offenderId=${offender.offenderId}&eventId=${convictionId}`,
        this.config.get<DeliusConfig>('delius').baseUrl,
      ).href,
    }
  }
}
