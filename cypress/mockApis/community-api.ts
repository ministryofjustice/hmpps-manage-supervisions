import { WireMockClient } from './wiremock-client'

export interface CreateAppointmentArgs {
  crn: string
  convictionId: number
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

  async stubCreateAppointment({ crn, convictionId }: CreateAppointmentArgs) {
    return this.client.stub({
      request: {
        method: 'POST',
        urlPath: `/community/secure/offenders/crn/${crn}/sentence/${convictionId}/appointments`,
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

  async stubOffenderDetails({ crn }: CreateAppointmentArgs) {
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
          title: 'Mr',
          firstName: 'Brian',
          surname: 'Cheese',
          dateOfBirth: '1970-01-01',
          gender: 'Male',
          otherIds: { crn },
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
                code: 'CRSSTAFF1',
                forenames: 'John',
                surname: 'Smith',
                unallocated: false,
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

  async stubGetConvictions({ crn, convictionId }: CreateAppointmentArgs) {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPath: `/community/secure/offenders/crn/${crn}/convictions`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: [
          {
            convictionId: convictionId,
            index: '4',
            active: true,
            inBreach: false,
            convictionDate: '2021-02-05',
            referralDate: '2021-02-17',
            offences: [
              {
                offenceId: 'M2500445193',
                mainOffence: true,
                detail: {
                  code: '07539',
                  description: 'Cheats at gambling or enables or assists person to cheat (Gambling Act 2005) - 07539',
                  mainCategoryCode: '075',
                  mainCategoryDescription: 'Betting, Gaming and Lotteries (Indictable)',
                  mainCategoryAbbreviation: 'Betting, Gaming and Lotteries (Indictable)',
                  ogrsOffenceCategory: 'Other offence',
                  subCategoryCode: '39',
                  subCategoryDescription:
                    'Cheats at gambling or enables or assists person to cheat (Gambling Act 2005)',
                  form20Code: '12',
                },
                offenceDate: '2021-02-01T00:00:00',
                offenceCount: 1,
                offenderId: 2500011641,
                createdDatetime: '2021-03-25T14:52:23',
                lastUpdatedDatetime: '2021-03-25T14:52:23',
              },
            ],
            sentence: {
              sentenceId: 2500427030,
              description: 'ORA Community Order',
              originalLength: 12,
              originalLengthUnits: 'Months',
              defaultLength: 12,
              lengthInDays: 364,
              expectedSentenceEndDate: '2022-02-16',
              startDate: '2021-02-17',
              sentenceType: {
                code: 'SP',
                description: 'ORA Community Order',
              },
            },
            latestCourtAppearanceOutcome: {
              code: '329',
              description: 'ORA Community Order',
            },
          },
        ],
      },
    })
  }

  async stubGetRequirements({ crn, convictionId }: CreateAppointmentArgs) {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPath: `/community/secure/offenders/crn/${crn}/convictions/${convictionId}/requirements`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          requirements: [
            {
              requirementId: 2500199144,
              startDate: '2021-01-03',
              active: true,
              requirementTypeSubCategory: {
                code: 'RARREQ',
                description: 'Rehabilitation Activity Requirement (RAR)',
              },
              requirementTypeMainCategory: {
                code: 'F',
                description: 'Rehabilitation Activity Requirement (RAR)',
              },
              length: 20,
              lengthUnit: 'Days',
              restrictive: false,
            },
          ],
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

  async stubGetStaffDetails() {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPath: `/community/secure/staff/username/USER1`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          username: 'USER1',
          email: 'john.smith@test',
          staffCode: 'CRSSTAFF1',
          staffIdentifier: 1234567,
          staff: {
            forenames: 'John',
            surname: 'Smith',
          },
          teams: [
            {
              code: 'CRSUAT',
              description: 'Unallocated',
              localDeliveryUnit: {
                code: 'CRSUAT',
                description: 'Unallocated LDU',
              },
              teamType: {
                code: 'CRSUAT',
                description: 'Unallocated Team Type',
              },
              district: {
                code: 'CRSUAT',
                description: 'Unallocated LDU',
              },
              borough: {
                code: 'CRSUAT',
                description: 'Unallocated Cluster',
              },
            },
          ],
        },
      },
    })
  }

  async getCreatedAppointments({ crn, convictionId }: CreateAppointmentArgs) {
    const requests = await this.client.getRequests(
      `/community/secure/offenders/crn/${crn}/sentence/${convictionId}/appointments`,
    )
    console.log(requests.map(x => JSON.parse(x.request.body)))
    return requests.map(x => JSON.parse(x.request.body))
  }
}
