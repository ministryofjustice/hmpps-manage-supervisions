# 12. Provide an Audit Trail via Logging

Date: 2021-08-06

## Status

Accepted

## Definitions

Some terms are used interchangeably. In this document, we use the following definitions:

* Action: Something that a user or system does.
* Recording: The process of storing historical information that can be analysed later on.
* Auditing: the process of analysing recorded information for security purposes.
* Logs / Log messages: textual strings, including structured data such as timestamps, that are written to a log file.
* Log file: a file containing a stream of log messages.
* Logging: the process of writing log messages.
* Event: a structured data object which records an action. May contain a log message as well as structured data on the actors and actions involved.

## Context

MoJ monitors use of its services [by recording actions that are performed](https://security-guidance.service.justice.gov.uk/logging-and-monitoring) via log or event recording. Raw log files for internal services are normally [retained for 13 months](https://security-guidance.service.justice.gov.uk/logging-and-monitoring/#log-retention).

To comply with security requirements, our service must not provide "unsupervised" access to
service user data. Keeping an audit trail of who has accessed and updated data is considered sufficient "supervision" for
this purpose. The security guidance includes a [set of actions that should be recorded for authenticated users](https://security-guidance.service.justice.gov.uk/custom-applications/#2-authenticated-user-activity-events):

* User/group identifier(s)
* Action/query
* Response size
* Response time

For Authority to Operate, the following [actions should be recorded](https://dsdmoj.atlassian.net/wiki/spaces/NDSS/pages/3053519229/Logging+Audit):

* Which users have accessed information
* Who completed transactions
* Who added/removed data

NDelius keeps a history of read and write actions taken through its UI, but not for its API. API
clients are responsible for recording of actions taken by their users.

HTTP-level logging is handled upstream by Cloud Platform, and user authentication actions
are recorded by HMPPS Auth.

## Decision

We will write log messages for at least the following events in our service, in all environments, using [NestJS's logging capability](https://javascript.plainenglish.io/how-to-use-nestjs-logger-2a9cb107bce9):

* Incoming HTTP requests (though some information will only be available to Cloud Platform)
* API calls we make to other services such as Community API (perhaps using [Axios request interceptors](https://itnext.io/advanced-nestjs-techniques-part-2-logging-outgoing-http-requests-3c75d47c5768))
* Any unexpected exceptions

We will include the [UUID](https://github.com/ministryofjustice/hmpps-auth/blob/9296135ad842e6ec01945d679666ffd46c98654a/src/main/kotlin/uk/gov/justice/digital/hmpps/oauth2server/model/UserDetail.kt) of the current authenticated user in all log messages.

These log messages will be written to application `stdout` and `stderr`, which are [automatically aggregated by Cloud Platform into Azure Application Insights](https://user-guide.cloud-platform.service.justice.gov.uk/documentation/logging-an-app/log-collection-and-storage.html#application-log-collection-and-storage), and which are retained there for 13 months. Correlation IDs in AppInsights allow reconstruction of cross-service data for comprehensive audit purposes; we should test that this is working before going live.

## Consequences

The upcoming MLAP system requires unmodified log files to ingest; they cannot rely on AppInsights exports cannot be relied upon. When
we need to get our data into that system, we will need to send log data directly to it. Hopefully, this can happen automatically at the Cloud Platform infrastructure level using a FluentBit output plugin.

We are not currently planning to store any extra custom event data in AppInsights, but should the demand arise, we can add that capability.

A new [HMPPS Audit API](https://github.com/ministryofjustice/hmpps-audit-api) is also under development; this service monitors an event queue
for audit events, and stores them for future inspection. We should investigate adding these granular audit events to our service once this project reaches a suitable level of maturity.

## References

* [MoJ Security Guidance](https://security-guidance.service.justice.gov.uk/#cyber-and-technical-security-guidance)
* [NCSC Introduction to logging for security purposes](https://www.ncsc.gov.uk/guidance/introduction-logging-security-purposes)
* [NIST Guide to Computer Security Log Management](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-92.pdf)
