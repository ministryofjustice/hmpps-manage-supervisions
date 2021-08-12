# 12. Provide an Audit Trail via Logging

Date: 2021-08-06

## Status

Accepted

## Context

MoJ monitors use of its services [by logging](https://security-guidance.service.justice.gov.uk/logging-and-monitoring).
Detailed logs for internal services are normally [retained for 13 months](https://security-guidance.service.justice.gov.uk/logging-and-monitoring/#log-retention).

To comply with security requirements, our service must not provide "unsupervised" access to
service user data.

Keeping an audit trail of who has accessed and updated data is sufficient "supervision" for
this purpose.

For Authority to Operate, the following [logging requirements](https://dsdmoj.atlassian.net/wiki/spaces/NDSS/pages/3053519229/Logging+Audit) must be met:

* Which users have accessed information
* Who completed transactions
* Who added/removed data

NDelius keeps an audit log of read and write access through its UI, but not for its API. API
clients are responsible for audit logging of accesses.

Logging of HTTP requests is handled upstream by Cloud Platform, and logging of user authentication
is handled by HMPPS Auth.

## Decision

We will log at least the following events in our service, in all environments, using [NestJS's logging capability](https://javascript.plainenglish.io/how-to-use-nestjs-logger-2a9cb107bce9):

* Incoming HTTP requests (though some information will only be available to Cloud Platform)
* API calls we make to other services such as Community API (perhaps using [Axios request interceptors](https://itnext.io/advanced-nestjs-techniques-part-2-logging-outgoing-http-requests-3c75d47c5768))
* Any unexpected exceptions

We will include the [UUID](https://github.com/ministryofjustice/hmpps-auth/blob/9296135ad842e6ec01945d679666ffd46c98654a/src/main/kotlin/uk/gov/justice/digital/hmpps/oauth2server/model/UserDetail.kt) of the current authenticated user in all log entries, in a suitable form to be [parsed by FluentBit](https://docs.fluentbit.io/manual/v/1.7/concepts/data-pipeline/parser).

These events will be written to:

* Application `stdout` and `stderr`, which are [aggregated by Cloud Platform into their Elasticsearch/Kibana system](https://user-guide.cloud-platform.service.justice.gov.uk/documentation/logging-an-app/log-collection-and-storage.html#application-log-collection-and-storage)
* Azure Application Insights, for legacy monitoring purposes

We will also write all log data to an S3 bucket for long-term retention. We will, if possible, [configure this to automatically happen at the infrastructure level](https://docs.fluentbit.io/manual/v/1.6/pipeline/outputs/s3), so that `stdout` and `stderr` are automatically stored there, rather than dealing with it separately in our code. This bucket will be set to expire data after 13 months.
## Consequences

The upcoming MLAP system requires unmodified logs to ingest; AppInsights exports cannot be relied upon. When
we need to get our data into that system, we will be able to use the raw logs stored in S3.

Logs are only retained for [30 days](https://user-guide.cloud-platform.service.justice.gov.uk/documentation/logging-an-app/log-collection-and-storage.html#application-log-collection-and-storage) in Kibana. This is insufficient for audit purposes,
so the S3 bucket will be the "channel of record" for our auditable logs. Both Kibana and AppInsights will only be used for
debugging and short-term monitoring of the service.

A new [HMPPS Audit API](https://github.com/ministryofjustice/hmpps-audit-api) is also under development; this service monitors a queue
for audit events, and stores them for future inspection. We should investigate adding these granular audit events to our service once this project reaches a suitable level of maturity.

## References

* [MoJ Security Guidance](https://security-guidance.service.justice.gov.uk/#cyber-and-technical-security-guidance)
* [NCSC Introduction to logging for security purposes](https://www.ncsc.gov.uk/guidance/introduction-logging-security-purposes)
* [NIST Guide to Computer Security Log Management](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-92.pdf)
