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
            orderTypes: ['CJA', 'LEGACY'],
          },
          {
            contactType: 'CHVS',
            description: 'Home Visit to Case (NS)',
            requiresLocation: 'NOT_REQUIRED',
            orderTypes: ['CJA', 'LEGACY'],
          },
          {
            contactType: 'APRE',
            description: 'Programme Pre-work (NS)',
            requiresLocation: 'REQUIRED',
            orderTypes: ['CJA', 'LEGACY'],
          },
          {
            contactType: 'C243',
            description: 'Alcohol Group Work Session (NS)',
            requiresLocation: 'REQUIRED',
            orderTypes: ['CJA', 'LEGACY'],
          },
          {
            contactType: 'C089',
            description: 'Alcohol Key Worker Session (NS)',
            requiresLocation: 'REQUIRED',
            orderTypes: ['CJA', 'LEGACY'],
          },
          {
            contactType: 'CITA',
            description: 'Citizenship Alcohol Session (NS)',
            requiresLocation: 'REQUIRED',
            orderTypes: ['CJA', 'LEGACY'],
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
        urlPath: `/community/secure/offenders/crn/${crn}/all`,
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
          offenderManagers: [
            {
              trustOfficer: {
                forenames: 'Unallocated Staff(N07)',
                surname: 'Staff',
              },
              staff: {
                code: 'N07UATU',
                forenames: 'Unallocated Staff(N07)',
                surname: 'Staff',
                unallocated: true,
              },
              partitionArea: 'National Data',
              softDeleted: false,
              team: {
                code: 'N07UAT',
                description: 'Unallocated Team(N07)',
                localDeliveryUnit: {
                  code: 'N07NPSA',
                  description: 'N07 Division',
                },
                district: {
                  code: 'N07NPSA',
                  description: 'N07 Division',
                },
                borough: {
                  code: 'N07100',
                  description: 'N07 Cluster 1',
                },
              },
              probationArea: {
                code: 'N07',
                description: 'NPS London',
                nps: true,
              },
              fromDate: '1900-01-01',
              active: true,
              allocationReason: {
                code: 'IN1',
                description: 'Initial Allocation',
              },
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

  async stubGetLocations() {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPath: `/community/secure/teams/N07UAT/office-locations`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: [
          {
            code: 'LDN_MTH',
            description: '117 STOCKWELL ROAD',
            buildingName: 'Moat House',
            buildingNumber: '117',
            streetName: 'Stockwell Road',
            townCity: 'London',
            county: 'Lambeth',
            postcode: 'SW9 9TN',
          },
          {
            code: 'LDN_BCR',
            description: '29/33 VICTORIA ROAD',
            buildingNumber: '29/31',
            streetName: 'Victoria Road',
            townCity: 'Romford',
            county: 'BarkingDag/Havering',
            postcode: 'RM1 2JT',
          },
          {
            code: 'DTVBIS1',
            description: 'Bishop Auckland',
            buildingName: 'Beechburn House',
            buildingNumber: '8',
            streetName: 'Kensington',
            townCity: 'Bishop Auckland',
            county: 'County Durham',
            postcode: 'DL14 6HX',
          },
        ],
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
