# 10. use-assess-risks-and-needs-api

Date: 2021-07-05

## Status

Accepted

Supercedes [9. Read Risks data from Offender Assessment API](0009-read-risks-data-from-offender-assessment-api.md)

## Context

Previously, we decided to read our data on Risk of Serious Harm (ROSH) and other assessments directly
from OASys, using the Offender Assessment API (see ADR #9). Since then, however, the Assess Risks & Needs
team has created a new domain-oriented [Assess Risks & Needs API](https://github.com/ministryofjustice/hmpps-assess-risks-and-needs)
which is intended to replace the Offender Assessment API, and decouple the data from OASys.

The Assess Risks & Needs API contains much of the data we need, but does not yet include criminogenic needs data.
However, the team are open to putting that on their backlog for us.

## Decision

Instead of the Offender Assessment API, we will use the Assess Risks & Needs API to fetch risk and need data. This avoids
building OASys concepts into our application, and instead means we are using a domain-oriented API that models updated
AR&N concepts correctly.

We will request that the AR&N team add any data we need that isn't currently provided.

## Consequences

As this API is new, we will need to remain aware of their delivery plans so that we can ensure that the features we need are
complete and deployed into the appropriate environments when we need them.
