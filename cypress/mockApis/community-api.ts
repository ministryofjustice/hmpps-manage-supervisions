import { WireMockClient } from './wiremock-client'

export interface CreateAppointmentArgs {
  crn: string
  sentenceId: number
}

export class CommunityMockApi {
  constructor(private readonly client: WireMockClient) {}

  async stubPing() {
    await this.client.stubPing('community')
  }

  async stubCreateAppointment({ crn, sentenceId }: CreateAppointmentArgs) {
    return this.client.stub({
      request: {
        method: 'POST',
        urlPath: `/community/offenders/crn/${crn}/sentence/${sentenceId}/appointments`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { appointmentId: 100 },
      },
    })
  }

  async getCreatedAppointments({ crn, sentenceId }: CreateAppointmentArgs) {
    const requests = await this.client.getRequests(
      `/community/offenders/crn/${crn}/sentence/${sentenceId}/appointments`,
    )
    return requests.map(x => JSON.parse(x.request.body))
  }
}
