# 9. Read Risks data from Offender Assessment API

Date: 2021-05-25

## Status

Superceded by [10. use-assess-risks-and-needs-api](0010-use-assess-risks-and-needs-api.md)

## Context

Our service needs to display risks to our users, using a number of standard risk flags and scores.

These are:
 - Risk indicators
   - ROSH (Risk of Serious Harm)
  - SARA
 - Predictors
  - OGR
  - RSR
  - OSP
 - Registrations
  - MAPPA

The risk indicators and predictors are currently mastered by OASys, but then mirrored into NDelius. Registration information (i.e. which registers an offender might be on) is mastered by NDelius.

A new [*Offender Assessments API*](https://github.com/ministryofjustice/offender-assessments-api-kotlin) has been created which allows risk indicator and predictor data to be read directly from OASys or a future replacement service. This service is live and available in all environments.

Confusingly, another API named the [*Assessments API*](https://github.com/ministryofjustice/hmpps-assessments-api) also exists, which allows clients to _perform_ assessments rather than read existing data. This service is not yet live, and is currently only intended to be used by the *Assess Risks & Needs* frontend.

## Decision

We will read and display risks data from the *Offender Assessments API* by default, which shows the latest data from OASys or equivalent.

We can read ROSH and SARA scores from the [getRisksForOasysOffenderId endpoint](https://offender-dev.aks-dev-1.studio-hosting.service.justice.gov.uk/swagger-ui/#/Offender%20SARA%2C%20ROSH%20risk%20indicators/getRisksForOasysOffenderIdUsingGET), and predictors from the [getPredictorScoresForOasysOffenderId endpoint](https://offender-dev.aks-dev-1.studio-hosting.service.justice.gov.uk/swagger-ui/#/Offender%20OGP%2C%20OGRs%2C%20OVP%20Predictors/getPredictorScoresForOasysOffenderIdUsingGET).

If we need to show changes, we can use the [getAssessmentsForOffender endpoint](https://offender-dev.aks-dev-1.studio-hosting.service.justice.gov.uk/swagger-ui/#/Assessments/getAssessmentsForOffenderUsingGET) to list assessments, then the [getRisksForOasysOffenderIdAndAssessmentId endpoint](https://offender-dev.aks-dev-1.studio-hosting.service.justice.gov.uk/swagger-ui/#/Offender%20SARA%2C%20ROSH%20risk%20indicators/getRisksForOasysOffenderIdAndAssessmentIdUsingGET) to get previous risk values to show a change. In future it may be possible to subscribe to a change event instead, but that isn't currently available.

Some other risk-related data, *registrations*, are held in NDelius. We will read them from the [getOffenderRegistrationsByCrn endpoint](https://community-api-public.test.probation.service.justice.gov.uk/swagger-ui/index.html#/Risks%20and%20Registrations/getOffenderRegistrationsByCrnUsingGET) in the community API. However, by default, any information that is available in OASys should be read from there, not from a copy of the data in NDelius.

## Consequences

The Assess Risks & Needs team are very receptive to requests for changes to the API; we are one of the first users, so they want to provide us with what we need and will iterate their product to do so.

Some data is currently held in both OASys and NDelius (e.g. RoSH scores that have corresponding registrations in Delius), with [an automated sync process that updates the Delius data](https://github.com/ministryofjustice/oasys-ndh-delius-replacement). Since the update is scheduled, rather than being instantaneous, the scores in Delius are eventually consistent, but there could be brief periods when Delius and OASys return conflicting information.
