import { Service } from 'typedi'
import { classToPlain } from 'class-transformer'
import RestClient from '../data/restClient'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'
import { CapiAppointmentCreateRequest } from './capiAppointmentCreateRequest.dto'
import { CapiAppointmentCreateResponse } from './capiAppointmentCreateResponse.dto'
import { ConfigService } from '../config'

@Service()
export class ArrangeAppointmentService {
  constructor(private readonly config: ConfigService) {}

  private restClient(token: string): RestClient {
    return new RestClient('Community API Client', this.config.apis.community, token)
  }

  async createAppointment(
    request: CapiAppointmentCreateRequest,
    crn: string,
    sentenceId: number,
    username: string
  ): Promise<number> {
    const authClient = new HmppsAuthClient(new TokenStore())
    const token = await authClient.getSystemClientToken(username)

    return this.restClient(token)
      .post({
        path: `/offenders/crn/${crn}/sentence/${sentenceId}/appointments`,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        data: classToPlain(request),
      })
      .then(response => (<CapiAppointmentCreateResponse>response).appointmentId) as Promise<number>
  }
}