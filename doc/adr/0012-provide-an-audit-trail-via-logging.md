# 12. Provide an Audit Trail via Logging

Date: 2021-08-06

## Status

Accepted

## Context

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

We will log at least the following events in our service, in all environments:

* Incoming HTTP requests (though some information will only be available to Cloud Platform)
* API calls we make to other services such as Community API
* Any unexpected exceptions

We will include the current authenticated user ID in all log entries.

These events will be written to:

* Application `stdout` and `stderr`, which are [aggregated by Cloud Platform into their Elasticsearch/Kibana system](https://user-guide.cloud-platform.service.justice.gov.uk/documentation/logging-an-app/log-collection-and-storage.html#application-log-collection-and-storage)
* Azure Application Insights, for legacy monitoring purposes

## Consequences

The upcoming MLAP system requires unmodified logs; AppInsights exports cannot be relied upon. When
we need to get our data into that systen, we are confident that the sufficiently detailed logs
[can be extracted from Kibana](https://user-guide.cloud-platform.service.justice.gov.uk/documentation/logging-an-app/access-logs.html#accessing-application-log-data), thus avoiding any need for us to store logs separately for that future purpose.

Logs are retained for [30 days](https://user-guide.cloud-platform.service.justice.gov.uk/documentation/logging-an-app/log-collection-and-storage.html#application-log-collection-and-storage) in Kibana. We must check if this is long enough for:

* MLAP ingestion at a later date - will they want all historical data?
* Auditing of requests - is a longer retention period required in case of a breach?
