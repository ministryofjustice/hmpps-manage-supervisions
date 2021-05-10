# 5. Authenticate users using HMPPS Auth

Date: 2021-03-15

## Status

Accepted

## Context

We need to authenticate users of our service, in order to know who they are, track their permissions, and audit their access.

HMPPS Auth is a system based on OAuth 2 flows which provides a common login mechanism for the latest HMPPS services.

Our users currently log in directly with nDelius.

We need to authenticate our service to the Community API, which requires HMPPS Auth client tokens.

## Decision

We will authenticate users using HMPPS Auth, integrated using `passport.js` as used in the template app.

We will use user credentials wherever possible to access data from external sources, via OAuth 2 grants, but where this is not possible (i.e. in Community API), we will use our own application credentials with the appropriate access roles, and log a user identifier with the services we use. For instance, when we write data to Community API, we will use our application's own credentials, but will store the user identifier along with the data we are writing for audit purposes.

## Consequences

All our users are nDelius users. In order to use the service they will need an HMPPS Auth account with a linked nDelius account. This linking should happen automatically if the same email address is used for both. If they do not have this set up, we will have to get their account configured for them. We do not anticipate this being a significant amount of work, however.

If data source APIs add functionality for delegated user authentication tokens, then we should adapt our code to use those wherever possible.

Note: This ADR does not cover authorisation, or permissions, for particular users.
