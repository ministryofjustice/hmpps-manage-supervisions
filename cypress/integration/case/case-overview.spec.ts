import { ViewCaseFixture } from './view-case.fixture'

context('Case overview tab', () => {
  const fixture = new ViewCaseFixture()

  it('displays offender overview', () => {
    const past = { appointmentStart: '2020-05-25T12:00:00+01:00', appointmentEnd: '2020-05-25T13:00:00+01:00' }
    cy.seed({
      appointments: [
        {
          appointmentStart: '2100-05-25T12:00:00+01:00',
          appointmentEnd: '2100-05-25T13:00:00+01:00',
          type: { contactType: 'CHVS' },
          staff: { unallocated: false, forenames: 'Laura', surname: 'Smith' },
        },
        { ...past, outcome: { complied: true, attended: true } },
        { ...past, outcome: { complied: false, attended: true } },
        { ...past, outcome: { complied: true, attended: false } },
      ],
      contacts: [
        {
          entries: [
            {
              type: { code: 'ABNP', appointment: true },
              outcome: { complied: true, attended: true },
            },
            {
              type: { code: 'ABNP', appointment: true },
              outcome: { complied: false, attended: false },
            },
            {
              type: { code: 'ABNP', appointment: true },
              outcome: null,
            },
          ],
        },
      ],
      convictions: {
        active: {
          conviction: { inBreach: true },
        },
        previous: [
          {
            conviction: {},
            nsis: [
              {
                active: false,
                nsiType: { code: 'BRE' },
                actualStartDate: '2018-12-10',
              },
            ],
          },
        ],
      },
    })

    fixture
      .whenViewingOffender()
      .shouldBeAccessible()
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('overview', page => {
        page.schedule(card => {
          card.value('Next appointment').contains('Tuesday 25 May 2100 at 12pm (Home visit with Laura Smith)')
        })

        page.personalDetails(card => {
          card.value('Name').contains('Liz Danger Haggis')
          card.value('Preferred name/Known as').contains('Bob')
          card.value('Gender').contains('Prefer to self-describe: Jedi')
          card.value('Date of birth').contains('10 June 1980')
          card.value('Mobile number').contains('07734 111992')
          card.value('Telephone number').contains('01234 111222')
          card
            .value('Current circumstances and disabilities')
            .contains(
              [
                'Employment: Temporary/casual work (30 or more hours per week)',
                'Learning Difficulties: Other',
                'Speech Impairment: None',
              ].join(' '),
            )
        })

        page.risk(card => {
          card.value('Risk of serious harm (ROSH) in the community').contains('Very high risk of serious harm')
          card.value('Risk of serious harm to themselves').contains('Current concerns')
          card.value('Risk flags').contains('Restraining Order')
        })

        page.sentence(card => {
          card
            .value('Main offence')
            .contains('Cheats at gambling or enables or assists person to cheat (Gambling Act 2005) (1 count)')
          card.value('Order').contains('12 month Community Order (12 months elapsed)')
          card.value('Requirements').contains('44 days RAR, 29 completed (2 requirements)')
          card.value('Previous orders').contains('1 previous order (1 breach on a previous order)')
        })

        page.activityAndCompliance(card => {
          card.value('Compliance').contains('Breach in progress. 1 prior breach on current order')
          card
            .value('Activity log')
            .contains('3 national standard appointments 1 without a recorded outcome 1 complied 1 unacceptable absence')
        })
      })
  })

  it('displays empty overview page', () => {
    cy.seed({
      risks: null,
      registrations: [],
      personalCircumstances: [],
      offender: {
        contactDetails: { phoneNumbers: [] },
        offenderProfile: { disabilities: [], genderIdentity: null, selfDescribedGender: null },
      },
      contacts: [],
      appointments: [],
      convictions: {
        active: { conviction: { inBreach: false, breachEnd: null }, requirements: [], nsis: [] },
        previous: [],
      },
    })
    fixture
      .whenViewingOffender()
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('overview', page => {
        page.schedule(card => {
          card.value('Next appointment').contains('No appointments scheduled')
        })

        page.personalDetails(card => {
          card.value('Gender').contains('Female')
          card.title('Mobile number').should('not.exist')
          card.title('Telephone number').should('not.exist')
          card.value('Current circumstances and disabilities').contains('None')
        })

        page.risk(card => {
          card.value('Risk of serious harm (ROSH) in the community').contains('There is no OASys risk assessment')
          card.value('Risk of serious harm to themselves').contains('There is no OASys risk assessment')
          card.value('Risk flags').contains('No risk flags')
        })

        page.sentence(card => {
          card.value('Requirements').contains('No requirements')
          card.value('Previous orders').contains('No previous orders')
        })

        page.activityAndCompliance(card => {
          card.value('Compliance').contains('No failures to comply within 12 months. No breaches on current order')
          card.value('Activity log').contains('No appointments')
        })
      })
  })
})
