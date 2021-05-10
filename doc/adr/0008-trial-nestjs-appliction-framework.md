# 8. Trial NestJS appliction framework

Date: 2021-05-10

## Status

Accepted

## Context

We expect this application to continue to be actively developed, and to continue to evolve to meet evolving user needs.

Our team feels it’s important for ongoing developer productivity and future scalability of the application, to have sufficient structure and conventions around the application architecture (covering concerns like established MVC patterns, TDD supporting patterns like dependency injection, conventions over configuration & tooling).

The [current HMPPS Typescript template](https://github.com/ministryofjustice/hmpps-template-typescript) does not provide any guidance or opinions around the application architecture, nor best practice patterns that should be followed and rolls its own custom tooling.

The [HMPPS Kotlin template](https://github.com/ministryofjustice/hmpps-template-kotlin) is built on Spring Boot, which provides a best-practice application architecture and tooling. Node.js projects do not currently benefit from the same approach.

The team has evaluated a number of options:

* Roll your own (like some other HMPPS Digital teams) - has the downside that you need to build, maintain and evolve your own structure, best practices and documentation. Any new developer has to learn everything you’ve done. It’s also a solved problem and there are no obvious advantages that this brings in the specific context of Prisons and Probation
* Use one of the top-3 popular frameworks in the Node ecosystem (Angular, React/Nextjs, Vue.js) - inappropriate because they involve client-side rendering which is [actively discouraged in the GOV.UK service manual](https://www.gov.uk/service-manual/technology/using-progressive-enhancement#using-interactive-elements) as it negatively impacts accessibility and browser/screen reader compatibility
* Use an established, open-source server side framework like [NestJS](https://nestjs.com/). Positives: healthy established community, documentation, free updates. Negatives: steeper learning curve for incoming developers than just knowing Node and Express.js, but less steep than for the “roll your own” option. The open source nature of the project means that the library could diverge from our requirements e.g. drop server side rendering or simply die. The team was able to recreate all of the Typescript template’s functionality using a NestJS-based prototype, using all the same libraries for authentication (passportjs), CSP (via helmet), templating (via nunjucks + the govuk UI) & session (via redis).

## Decision

We will use NestJS as an application framework for our service, in order to boost development speed and productivity.

We believe that NestJS provides a well-defined application structure, fully compatible with the technology choices in the existing Typescript template, and which provides a consistent and well-documented developer experience.

The decision to trial NestJS has been approved by the [Technical Advisory Board](https://dsdmoj.atlassian.net/wiki/spaces/NDSS/pages/3236135071/nestjs+New+Technology+Proposal)

## Consequences

Developers joining the project may be unfamiliar with NestJS. To mitigate this, we will include a clear description of the application structure in the project README, along with links to the getting started guides, documentation, and video tutorials for the framework. We believe that this will provide a significantly clearer onboarding experience than would exist for a self-written framework.

If this decision is judged a success upon project delivery, we should aim to port our approach into the existing Typescript template, as an improvement for future teams.

The NestJS framework may evolve in a direction that does not suit the needs of HMPPS. We do not anticipate this being an issue, as the project has [over 67 thousand GitHub repositories and 3000 packages](https://github.com/nestjs/nest/network/dependents) that depend on it, but if it does happen, Nest is MIT licensed and we could fork it for our own needs.

We may experience problems working with the framework, or have questions on how to achieve certain outcomes with it. Unusually for an open source project, the Nest team does provide a commercial support option, which we could access if we run into any blockers. The project also has an active community on [Stack Overflow](https://stackoverflow.com/questions/tagged/nestjs) and Discord, where community support would be available.

## Actions

The team will report to the Technical Advisory Board around 2 months after the trial begins, in order to make an assessment as to whether the trial has been successful. When new developers join the team during the trial, particular attention should be paid to the ease of their onboarding process, in order to help with this assessment.
