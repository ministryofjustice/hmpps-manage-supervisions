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
        urlPath: `/community/secure/offenders/crn/${crn}/sentence/${sentenceId}/appointments`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          appointmentId: 100,
          appointmentStart: '2021-05-06T09:00:00.000Z',
          appointmentEnd: '2021-05-06T11:00:00.000Z',
          typeDescription: 'Office Visit',
        },
      },
    })
  }

  async stubOffenderDetails(crn: string) {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPath: `/community/secure/offenders/crn/${crn}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          offenderId: 2500011641,
          title: 'Dr',
          firstName: 'Beth',
          surname: 'Cheese',
          dateOfBirth: '1970-01-01',
          gender: 'Female',
          otherIds: { crn: 'X009923' },
          contactDetails: {},
          offenderProfile: {
            offenderLanguages: {},
            remandStatus: 'Bail - Unconditional',
            previousConviction: {},
          },
          phoneNumbers: [
            {
              type: 'MOBILE',
              number: '07734 111992',
            },
          ],
          softDeleted: false,
          currentDisposal: '1',
          partitionArea: 'National Data',
          currentRestriction: false,
          currentExclusion: false,
          activeProbationManagedSentence: true,
        },
      },
    })
  }

  async getCreatedAppointments({ crn, sentenceId }: CreateAppointmentArgs) {
    const requests = await this.client.getRequests(
      `/community/secure/offenders/crn/${crn}/sentence/${sentenceId}/appointments`,
    )
    return requests.map(x => JSON.parse(x.request.body))
  }
}
