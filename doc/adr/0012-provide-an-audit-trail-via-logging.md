# 12. Provide an Audit Trail via Logging

Date: 2021-08-06

## Status

Accepted

## Context

To comply with security requirements, our service must not provide "unsupervised" access to
service user data.

Keeping an audit trail of who has accessed and updated data is sufficient "supervision" for
this purpose.

NDelius keeps an audit log of read and write access through its UI, but not for its API. API
clients are responsible for audit logging of accesses.

Logging of HTTP requests is handled upstream by Cloud Platform, and logging of user authentication
is handled by HMPPS Auth.

## Decision

We will log at least the following events in our service, in all environments:

* Incoming HTTP requests (though some information will only be available to Cloud Platform)
* API calls we make to other services such as Community API

These events will be written to:

* Application `stdout` and `stderr`, which are aggregated by Cloud Platform into their Elasticsearch/Kibana system
* Azure Application Insights, for legacy monitoring purposes

## Consequences

The upcoming MLAP system requires unmodified logs; AppInsights exports cannot be relied upon. When
we need to get our data into that systen, we are confident that the original, unmodified log messages
can be extracted from Kibana, thus avoiding any need for us to store logs separately for that future
purpose.

Logs are retained for X in Kibana... need to know how long and if this is enough time for audit.

TBC
