import { WireMockClient } from './wiremock-client'
import { merge } from 'lodash'

export interface CreateAppointmentArgs {
  crn: string
  convictionId: number
}

export interface StubGetPersonalCircumstancesOptions {
  crn: string
}

export interface StubGetPersonalContactsOptions {
  crn: string
}

export interface StubOffenderAppointmentOptions {
  crn: string
  partials: {
    start: string
    end: string
    type?: { code?: string; name?: string }
    staff?: { forenames?: string; surname?: string }
    outcome?: {
      attended?: boolean
      complied?: boolean
    }
  }[]
}

export interface StubContactSummaryOptions {
  crn: string
  partials: any[]
  query: any
}

export interface StubGetRequirementsOptions {
  crn: string
  convictionId?: number
}

export interface StubGetConvictionsOptions {
  crn: string
  convictionId?: number
  current?: boolean
  previous?: boolean
}
export interface StubOffenderRegistrationOptions {
  crn: string
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
          preferredName: 'Bob',
          dateOfBirth: '1980-06-10',
          previousSurname: 'Smith',
          gender: 'Male',
          otherIds: { crn, pncNumber: '2012/123400000F' },
          contactDetails: {
            addresses: [
              {
                from: '2015-07-16',
                noFixedAbode: false,
                addressNumber: '1',
                streetName: 'High Street',
                town: 'Sheffield',
                county: 'South Yorkshire',
                postcode: 'S10 1AG',
                notes: 'Sleeping on sofa',
                telephoneNumber: '0123456789',
                status: {
                  code: 'M',
                  description: 'Main',
                },
                type: {
                  code: 'A02',
                  description: 'Approved Premises',
                },
                typeVerified: true,
                latestAssessmentDate: '2021-06-11T12:00:00',
                createdDatetime: '2021-06-11T13:00:00',
                lastUpdatedDatetime: '2021-06-11T14:00:00',
              },
              {
                from: '2001-07-16',
                to: '2015-07-16',
                noFixedAbode: true,
                status: {
                  code: 'M',
                  description: 'Main',
                },
                type: {
                  code: 'T',
                  description: 'Tent',
                },
              },
              {
                from: '2016-01-08',
                noFixedAbode: false,
                addressNumber: '24',
                buildingName: 'The Mill',
                streetName: 'Sherbourne Street',
                town: 'Birmingham',
                county: 'West Midlands',
                postcode: 'B16 8TP',
                status: {
                  code: 'S',
                  description: 'Secondary',
                },
                typeVerified: false,
                createdDatetime: '2018-07-09T13:58:58',
                lastUpdatedDatetime: '2018-08-01T02:02:07',
              },
            ],
            phoneNumbers: [
              {
                type: 'MOBILE',
                number: '07734 111992',
              },
              {
                type: 'TELEPHONE',
                number: '01234 111222',
              },
            ],
            emailAddresses: ['example@example.com', 'example2@example2.com'],
          },
          offenderProfile: {
            offenderLanguages: {
              primaryLanguage: 'Bengali',
              requiresInterpreter: true,
            },
            remandStatus: 'Bail - Unconditional',
            previousConviction: {},
            religion: 'Christian',
            genderIdentity: 'Prefer to self-describe',
            selfDescribedGender: 'Jedi',
            sexualOrientation: 'Bisexual',
            disabilities: [
              {
                disabilityId: 2500079588,
                disabilityType: {
                  code: 'LD',
                  description: 'Learning Difficulties',
                },
                startDate: '2021-02-01',
                provisions: [
                  {
                    provisionId: 2500075159,
                    startDate: '2021-05-10',
                    provisionType: {
                      code: '99',
                      description: 'Other',
                    },
                    notes: 'Extra tuition',
                  },
                ],
              },
              {
                disabilityId: 2500080089,
                disabilityType: {
                  code: 'SI',
                  description: 'Speech Impairment',
                },
                startDate: '2021-03-01',
                notes: 'Talks like a pirate',
              },
              {
                disabilityId: 2500080089,
                disabilityType: {
                  code: 'D',
                  description: 'Dyslexia',
                },
                startDate: '2020-04-01',
                endDate: '2020-05-01',
              },
            ],
          },
          offenderAliases: [
            { firstName: 'Dylan', surname: 'Meyer' },
            { firstName: 'Romario', surname: 'Montgomery' },
          ],
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

  async stubGetConvictions({ crn, convictionId = 1, current = true, previous = false }: StubGetConvictionsOptions) {
    const convictions = []
    if (current) {
      convictions.push({
        convictionId: convictionId,
        index: '4',
        active: true,
        inBreach: false,
        convictionDate: '2020-02-05',
        referralDate: '2020-02-17',
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
              subCategoryDescription: 'Cheats at gambling or enables or assists person to cheat (Gambling Act 2005)',
              form20Code: '12',
            },
            offenceDate: '2021-02-01T00:00:00',
            offenceCount: 1,
            offenderId: 2500011641,
            createdDatetime: '2021-03-25T14:52:23',
            lastUpdatedDatetime: '2021-03-25T14:52:23',
          },
          {
            offenceId: 'M2500297061',
            mainOffence: false,
            detail: {
              code: '10400',
              description: 'Assault on Police Officer - 10400',
              mainCategoryCode: '104',
              mainCategoryDescription: 'Assault on Police Officer',
              mainCategoryAbbreviation: 'Assault on Police Officer',
              ogrsOffenceCategory: 'Violence',
              subCategoryCode: '00',
              subCategoryDescription: 'Assault on Police Officer',
              form20Code: '88',
            },
            offenceDate: '2019-09-09T00:00:00',
            offenceCount: 1,
            offenderId: 2500343964,
            createdDatetime: '2019-09-17T00:00:00',
            lastUpdatedDatetime: '2019-09-17T00:00:00',
          },
        ],
        sentence: {
          sentenceId: 2500427030,
          description: 'ORA Community Order',
          originalLength: 12,
          originalLengthUnits: 'Months',
          defaultLength: 12,
          lengthInDays: 364,
          expectedSentenceEndDate: '2021-02-16',
          startDate: '2020-02-17',
          sentenceType: {
            code: 'SP',
            description: 'ORA Community Order',
          },
        },
        latestCourtAppearanceOutcome: {
          code: '329',
          description: 'ORA Community Order',
        },
        responsibleCourt: {
          courtId: 1500004905,
          code: 'SHEFMC',
          selectable: true,
          courtName: 'Sheffield Magistrates Court',
          telephoneNumber: '0300 047 0777',
          fax: '0114 2756 373',
          buildingName: 'Castle Street',
          town: 'Sheffield',
          county: 'South Yorkshire',
          postcode: 'S3 8LU',
          country: 'England',
          courtTypeId: 310,
          createdDatetime: '2014-05-29T21:50:16',
          lastUpdatedDatetime: '2019-05-10T23:24:48',
          probationAreaId: 1500001001,
          probationArea: {
            code: 'N02',
            description: 'NPS North East',
          },
          courtType: {
            code: 'MAG',
            description: 'Magistrates Court',
          },
        },
        courtAppearance: {
          courtAppearanceId: 2500316926,
          appearanceDate: '2019-09-04T00:00:00',
          courtCode: 'NOTTS',
          courtName: 'Nottingham Crown Court',
          appearanceType: {
            code: 'S',
            description: 'Sentence',
          },
          crn: 'X320741',
        },
      })
    }

    if (previous) {
      convictions.push({
        convictionId: convictionId + 1,
        index: '1',
        active: false,
        inBreach: false,
        convictionDate: '2020-12-01',
        referralDate: '2020-12-04',
        offences: [
          {
            offenceId: 'M2500445194',
            mainOffence: true,
            detail: {
              code: '07539',
              description: 'Cheats at gambling or enables or assists person to cheat (Gambling Act 2005) - 07539',
              mainCategoryCode: '075',
              mainCategoryDescription: 'Betting, Gaming and Lotteries (Indictable)',
              mainCategoryAbbreviation: 'Betting, Gaming and Lotteries (Indictable)',
              ogrsOffenceCategory: 'Other offence',
              subCategoryCode: '39',
              subCategoryDescription: 'Cheats at gambling or enables or assists person to cheat (Gambling Act 2005)',
              form20Code: '12',
            },
            offenceDate: '2020-11-01T00:00:00',
            offenceCount: 1,
            offenderId: 2500011641,
            createdDatetime: '2021-03-25T14:52:23',
            lastUpdatedDatetime: '2021-03-25T14:52:23',
          },
        ],
        sentence: {
          sentenceId: 2500427031,
          description: 'ORA Community Order',
          originalLength: 12,
          originalLengthUnits: 'Months',
          defaultLength: 12,
          lengthInDays: 364,
          expectedSentenceEndDate: '2021-01-31',
          startDate: '2020-12-01',
          sentenceType: {
            code: 'SP',
            description: 'ORA Community Order',
          },
        },
        latestCourtAppearanceOutcome: {
          code: '329',
          description: 'ORA Community Order',
        },
        responsibleCourt: {
          courtId: 1500004905,
          code: 'SHEFMC',
          selectable: true,
          courtName: 'Sheffield Magistrates Court',
          telephoneNumber: '0300 047 0777',
          fax: '0114 2756 373',
          buildingName: 'Castle Street',
          town: 'Sheffield',
          county: 'South Yorkshire',
          postcode: 'S3 8LU',
          country: 'England',
          courtTypeId: 310,
          createdDatetime: '2014-05-29T21:50:16',
          lastUpdatedDatetime: '2019-05-10T23:24:48',
          probationAreaId: 1500001001,
          probationArea: {
            code: 'N02',
            description: 'NPS North East',
          },
          courtType: {
            code: 'MAG',
            description: 'Magistrates Court',
          },
        },
        courtAppearance: {
          courtAppearanceId: 2500316926,
          appearanceDate: '2020-12-01T00:00:00',
          courtCode: 'SHEFMC',
          courtName: 'Sheffield Magistrates Court',
          appearanceType: {
            code: 'S',
            description: 'Sentence',
          },
          crn: 'X320741',
        },
      })
    }

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
        jsonBody: convictions,
      },
    })
  }

  async stubGetRequirements({ crn, convictionId = 1 }: StubGetRequirementsOptions) {
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
                code: 'SOME_CODE',
                description: 'Rehabilitation Activity Requirement (RAR)',
              },
              requirementTypeMainCategory: {
                code: 'F',
                description: 'Rehabilitation Activity Requirement (RAR)',
              },
              length: 20,
              lengthUnit: 'Days',
              restrictive: false,
              rarCount: 5,
            },
          ],
        },
      },
    })
  }

  async stubGetPersonalContacts({ crn }: StubGetPersonalContactsOptions) {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPath: `/community/secure/offenders/crn/${crn}/personalContacts`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: [
          {
            personalContactId: 2500058493,
            relationship: 'Wife',
            startDate: '2019-09-13T00:00:00',
            title: 'Dr',
            firstName: 'Pippa',
            surname: 'Wade',
            gender: 'Female',
            relationshipType: {
              code: 'NK',
              description: 'Next of Kin',
            },
            notes: 'Divorced',
            address: {
              addressNumber: '64',
              streetName: 'Ermin Street',
              town: 'Wrenthorpe',
              county: 'West Yorkshire',
              postcode: 'WF2 8WT',
              telephoneNumber: '07073735801',
            },
            mobileNumber: '07700 900 141',
            createdDatetime: '2019-09-13T00:00:00',
            lastUpdatedDatetime: '2019-09-13T00:00:00',
          },
          {
            personalContactId: 2500058494,
            relationship: 'Father',
            startDate: '2019-09-13T00:00:00',
            title: 'Mr',
            firstName: 'Jonathon',
            surname: 'Bacon',
            gender: 'Male',
            relationshipType: {
              code: 'OF',
              description: 'Family member',
            },
            createdDatetime: '2019-09-13T00:00:00',
            lastUpdatedDatetime: '2019-09-13T00:00:00',
          },
        ],
      },
    })
  }

  async stubGetPersonalCircumstances({ crn }: StubGetPersonalCircumstancesOptions) {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPath: `/community/secure/offenders/crn/${crn}/personalCircumstances`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          personalCircumstances: [
            {
              personalCircumstanceId: 2500140003,
              offenderId: 2500530364,
              personalCircumstanceType: {
                code: 'B',
                description: 'Employment',
              },
              personalCircumstanceSubType: {
                code: 'B03A',
                description: 'Temporary/casual work (30 or more hours per week)',
              },
              startDate: '2021-03-03',
              probationArea: {
                code: 'N07',
                description: 'NPS London',
              },
              evidenced: false,
              createdDatetime: '2021-03-03T12:02:00',
              lastUpdatedDatetime: '2021-03-04T13:04:00',
            },
            {
              personalCircumstanceId: 2500147504,
              offenderId: 2500184815,
              personalCircumstanceType: {
                code: 'H',
                description: 'Relationship',
              },
              personalCircumstanceSubType: {
                code: 'H02',
                description: 'Married / Civil partnership',
              },
              startDate: '2005-04-01',
              endDate: '2021-07-02',
              probationArea: {
                code: 'N07',
                description: 'NPS London',
              },
              evidenced: true,
              notes: 'Divorced',
              createdDatetime: '2005-04-01T12:02:00',
              lastUpdatedDatetime: '2021-07-02T13:04:00',
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

  async stubOffenderAppointments({ crn, partials = [] }: StubOffenderAppointmentOptions) {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPath: `/community/secure/offenders/crn/${crn}/appointments`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: partials.map((x, i) => ({
          appointmentId: i + 1,
          appointmentStart: x.start,
          appointmentEnd: x.end,
          notes: 'monetize next-generation action-items',
          officeLocation: {
            code: '58c9c12a-8121-497d-b0ff-f576d3d7adc7',
            buildingName: 'Odie',
            buildingNumber: '430',
            streetName: 'Larkin Mountain',
            townCity: 'Shieldsland',
            county: 'Buckinghamshire',
            postcode: '34887',
            description: '80664 Casper Plains',
          },
          outcome: {
            code: '27524882-18fd-4a0e-b971-99a8f1b831e7',
            attended: x.outcome?.attended === undefined ? true : x.outcome?.attended,
            complied: x.outcome?.complied === undefined ? true : x.outcome?.complied,
            description: 'e-enable out-of-the-box networks',
            hoursCredited: 38436,
          },
          sensitive: false,
          type: {
            contactType: x.type?.code || 'APAT',
            description: x.type?.name || 'Some office visit',
            orderTypes: ['CJA', 'CJA'],
            requiresLocation: 'NOT_REQUIRED',
          },
          provider: {
            code: '21f0232b-1676-420a-92ec-9ebbd11e3f49',
            description: 'morph granular infomediaries',
          },
          team: {
            code: '96602333-b9a2-42d4-8d3e-0764ed2a6042',
            description: 'repurpose next-generation solutions',
          },
          staff: {
            code: '067232a5-96f4-436b-aa61-beb68cc0bc44',
            forenames: x.staff?.forenames || 'Some',
            surname: x.staff?.surname || 'Staff',
            unallocated: false,
          },
        })),
      },
    })
  }

  async getCreatedAppointments({ crn, convictionId }: CreateAppointmentArgs) {
    const requests = await this.client.getRequests(
      `/community/secure/offenders/crn/${crn}/sentence/${convictionId}/appointments`,
    )
    return requests.map(x => JSON.parse(x.request.body))
  }

  async stubContactSummary({ crn, partials, query = {} }: StubContactSummaryOptions) {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPath: `/community/secure/offenders/crn/${crn}/contact-summary`,
        queryParameters: Object.entries(query)
          .map(([k, v]) => ({ [k]: { equalTo: v } }))
          .reduce((x, y) => ({ ...x, ...y }), {}),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          content: partials.map((partial, i) =>
            merge(
              {
                contactId: i + 1,
                contactStart: '2020-09-03T12:00:00+01:00',
                contactEnd: '2020-09-03T13:00:00+01:00',
                type: {
                  code: 'CHVS',
                  description: 'Home Visit to Case (NS)',
                  appointment: true,
                },
                notes: 'Some home visit appointment',
                provider: {
                  code: 'N02',
                  description: 'NPS North East',
                },
                team: {
                  code: 'N02SP5',
                  description: 'BRADFORD\\BULLS SP',
                },
                staff: {
                  code: 'N02SP5U',
                  forenames: 'Mark',
                  surname: 'Berridge',
                  unallocated: false,
                },
              },
              partial,
            ),
          ),
          number: 0,
          size: partials.length || 10,
          numberOfElements: partials.length,
          totalPages: partials.length === 0 ? 0 : 1,
          totalElements: partials.length,
          first: true,
          last: false,
          empty: partials.length === 0,
        },
      },
    })
  }

  async stubOffenderRegistrations({ crn }: StubOffenderRegistrationOptions) {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPath: `/community/secure/offenders/crn/${crn}/registrations`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          registrations: [
            {
              registrationId: 2500203758,
              offenderId: 2500530364,
              register: {
                code: '2',
                description: 'Alerts',
              },
              type: {
                code: 'RSTO',
                description: 'Restraining Order',
              },
              riskColour: 'Amber',
              startDate: '2021-07-02',
              nextReviewDate: '2022-01-02',
              reviewPeriodMonths: 6,
              registeringTeam: {
                code: 'N07T01',
                description: 'OMU A',
              },
              registeringOfficer: {
                code: 'N07P007',
                forenames: 'Archibald ZZ',
                surname: 'Queeny',
                unallocated: false,
              },
              registeringProbationArea: {
                code: 'N07',
                description: 'NPS London',
              },
              warnUser: false,
              active: true,
              numberOfPreviousDeregistrations: 0,
            },
            {
              registrationId: 2500204257,
              offenderId: 2500530364,
              register: {
                code: '1',
                description: 'RoSH',
              },
              type: {
                code: 'RMRH',
                description: 'High RoSH',
              },
              riskColour: 'Red',
              startDate: '2021-07-05',
              nextReviewDate: '2022-01-05',
              reviewPeriodMonths: 6,
              registeringTeam: {
                code: 'N07CHT',
                description: 'Automation SPG',
              },
              registeringOfficer: {
                code: 'N07A060',
                forenames: 'NDelius26',
                surname: 'NDelius26',
                unallocated: false,
              },
              registeringProbationArea: {
                code: 'N07',
                description: 'NPS London',
              },
              warnUser: false,
              active: true,
              numberOfPreviousDeregistrations: 0,
            },
          ],
        },
      },
    })
  }
}
