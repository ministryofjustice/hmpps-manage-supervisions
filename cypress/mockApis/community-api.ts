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

  async stubGetAppointmentTypes() {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPath: '/community/secure/appointment-types',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: [
          {
            contactType: 'APAT',
            description: 'Programme Session (NS)',
            requiresLocation: 'REQUIRED',
            orderTypes: ['CJA_2003', 'LEGACY'],
          },
          {
            contactType: 'CHVS',
            description: 'Home Visit to Case (NS)',
            requiresLocation: 'NOT_REQUIRED',
            orderTypes: ['CJA_2003', 'LEGACY'],
          },
          {
            contactType: 'APRE',
            description: 'Programme Pre-work (NS)',
            requiresLocation: 'REQUIRED',
            orderTypes: ['CJA_2003', 'LEGACY'],
          },
        ],
      },
    })
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
          contactDetails: {
            phoneNumbers: [
              {
                type: 'MOBILE',
                number: '07734 111992',
              },
            ],
          },
          offenderProfile: {
            offenderLanguages: {},
            remandStatus: 'Bail - Unconditional',
            previousConviction: {},
          },
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
