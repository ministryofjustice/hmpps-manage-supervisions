# 8. Trial NestJS application framework

Date: 2021-05-10

## Status

Accepted

## Context

We expect this application to be actively developed for a significant time, and to continue to evolve to meet evolving user needs.

For a long-running project, it is helpful to have a well-defined application structure and standard, covering concerns like established MVC patterns, TDD, dependency injection, conventions over configuration, and toolchain. This helps both the productivity of existing developers, but helps with knowledge transfer around the team as new developers are brought on.

The [current HMPPS Typescript template](https://github.com/ministryofjustice/hmpps-template-typescript) does not provide any guidance or opinions around the application architecture, nor best practice patterns that should be followed and rolls its own custom tooling.

The [HMPPS Kotlin template](https://github.com/ministryofjustice/hmpps-template-kotlin) is built on Spring Boot, which provides a best-practice application architecture and tooling. Node.js projects do not currently benefit from the same approach.

The team has evaluated a number of options:

* **Roll your own**: this is the approach taken by many other HMPPS Digital Teams. Each team defines its application layout and toolchain in its own way. This has the downside that you need to build, maintain and evolve your own structure, best practices and documentation, and any new developer has to learn everything you’ve done. There is also the fact that this process that has been done many times by different teams, with no obvious advantage in the duplication of that work.
* **Use a very well-known framework**: There are some very common application systems in the NodeJS ecosystem, such as Angular, React, NextJS, and Vue.js. However, these focus on client-side applications, and are inappropriate because they involve client-side rendering which is [actively discouraged in the GOV.UK service manual](https://www.gov.uk/service-manual/technology/using-progressive-enhancement#using-interactive-elements), as it negatively impacts accessibility and browser/screen reader compatibility.
* **Use an opinionated server side application framework**: primarily [NestJS](https://nestjs.com/), but others have been assessed as well (see [TAB notes](https://dsdmoj.atlassian.net/wiki/spaces/NDSS/pages/3236135071/nestjs+New+Technology+Proposal) for discussion). NestJS has a healthy established community, good documentation, and is open source. There mnay be a slightly steeper learning curve for incoming developers than just knowing Node and Express.js, but that curve would still exist with the "roll your own" option, and at least the available documentation for a popular project like NestJS will be better than anything we would write in-house. As a proof of concept, the team was able to recreate all of the Typescript template’s functionality using a NestJS-based prototype, using all the same libraries for authentication (passportjs), CSP (via helmet), templating (via nunjucks + the govuk UI) & session (via redis).

## Decision

We will use NestJS as an application framework for our service, in order to boost development speed, productivity, and knowledge transfer.

We believe that NestJS provides a well-defined application structure and a consistent and well-documented developer experience. NestJS has a modular design that allows us to use all the technology choices in the existing Typescript template, such as Express, Sequelize, and so on.

The decision to trial NestJS has been approved by the [Technical Advisory Board](https://dsdmoj.atlassian.net/wiki/spaces/NDSS/pages/3236135071/nestjs+New+Technology+Proposal). See the notes and comments there for more detailed analysis of NestJS in terms of popularity, security, and comparison to other similar products.

## Consequences

Developers joining the project may be unfamiliar with NestJS. To mitigate this, we will include a clear description of the application structure in the project README, along with links to the getting started guides, documentation, and video tutorials for the framework. We believe that this will provide a significantly clearer onboarding experience than would exist for a self-written framework.

If this trial is judged a success, we should aim to port our approach into the existing Typescript template, as an improvement for future teams. The benefit of a standardised approach pays off properly when it is used across multiple projects.

The NestJS framework may evolve in a direction that does not suit the needs of HMPPS. We do not anticipate this being an issue, as the project has [over 67 thousand GitHub repositories and 3000 packages](https://github.com/nestjs/nest/network/dependents) that depend on it, but if it does happen, Nest is MIT licensed and we could fork it for our own needs.

We may experience problems working with the framework, or have questions on how to achieve certain outcomes with it. Unusually for an open source project, the Nest team does provide a commercial support option, which we could access if we run into any blockers. The project also has an active community on [Stack Overflow](https://stackoverflow.com/questions/tagged/nestjs) and Discord, where community support would be available.

## Actions

The team will report to the Technical Advisory Board around 2 months after the trial begins, in order to make an assessment as to whether the trial has been successful. When new developers join the team during the trial, particular attention should be paid to the ease of their onboarding process, in order to help with this assessment.
