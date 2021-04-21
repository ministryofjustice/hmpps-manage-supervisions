# 7. Identify Service Users using flexible URNs, initially encapsulating a CRN

Date: 2021-04-21

## Status

Accepted

## Context

In building our product, we need to uniquely identify service users. However, there is no single unique identifier for all service users across HMPPS.

We are working primarily with service user data from National Delius (nDelius). Community API exposes SU data from nDelius by either Case Reference Number (CRN) or (National Offender Management System) NOMS number in [its REST API](https://community-api-secure.test.delius.probationhmpp.hmpps.dsd.io/swagger-ui/index.html#/Core%20offender).

Data is moving out of nDelius over time into alternative services. For now we can consider it the canonical data owner of the service user, but that may change in future.

## Decision

We will identify service users by a [Uniform Resource Name (URN)](https://en.wikipedia.org/wiki/Uniform_Resource_Name) in the format `urn:justice:{service}:{identifier_type}:{identifier_value}`. When we store a service user identifier, whether in our own database or in client storage, we will use this complete format.

At this time, we will only support URNs that describe the CRN of a service user in nDelius. These will all be in the form `urn:justice:ndelius:crn:{crn}`, where `{crn}` is the actual value of the service user's CRN.

We choose to use URNs in order to future-proof our system against inevitable changes of identifier in future. It is important to state that we do not *need* to do this at this point; we are only dealing with one service and one identifier, and we will most likely delay any non-trivial implementation of the full URN structure until we need to support more data sources. However, in this ADR we are setting our direction, and aim to promote the idea of URNs as a flexible solution to identifying data objects across HMPPS.

While we should store the full URN internally once we need to do so, until we support more than one type, it is not necessary to display the complete URN to the user - we can just use the final component, knowing that the other components will not change.

We will use a shortened form of the full identifier in the page URLs for our service where appropriate, such as `/service_user/{crn}/appointments`. As the request path is encrypted by HTTPS, there is no heightened risk of leaking personally identifying information (PII) by doing so.

## Consequences

Some service users known to HMPPS may not have a CRN. However, we understand that any service user on probation will have a CRN. If that is incorrect, we will need to either state that we do not support SUs without a CRN, or extend our URN scheme to include alternative identifiers. For instance, it may be necessary to use NOMS numbers instead, producing URNs like `urn:justice:ndelius:noms:{nomsNumber}`. Or, to refer to data owned by a hypothetical future "Single Offender View" service, we may use a URN like `urn:justice:sov:crn:{crn}`.

This decision should be revisited when a HMPPS-wide unique identifier approach for service users is adopted. If the approach is incompatible with this decision, we should refactor and change our approach to match.

We may also wish to follow this approach when referring to any data object outside our service. For instance, an appointment owned by the Interventions service would be referred to as `urn:justice:interventions:appointment:{id}`.

This flexibility comes at the expense of complicating the code slightly, though the logic for converting URNs to the bare identifiers is simple and easily shared across our code, or even across services via an `npm` package.
