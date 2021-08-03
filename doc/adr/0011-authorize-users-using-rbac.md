# 11. Authorize users using RBAC

Date: 2021-07-26

## Status

Accepted

## Context

Our service should only be available to probation practitioners, but at the pilot stage, only approved practitioners will have access. We need to be able to control access to the service and limit it to specific logged in users. Our users should only be able to meaningfully interact with cases that are assigned to them.

We believe that at present, fine-grained access controls in NDelius only apply to writes, and there are no cases in NDelius that a practitioner would be prevented from reading if they knew the relevant CRN.

## Decision

We will introduce an HMPPS Auth role that prevents practitioners that we haven’t invited from accessing our service. The role will be created and assigned to users in Delius RBAC, and then mapped to an HMPPS Auth role.

Steps:

1. Create a new RBAC in Delius
2. Map that RBAC to a ROLE on HMPPS Auth
3. Add that RBAC to pilot users

All our participants will only be shown cases that are assigned to them. While it’s possible to engineer the URL to access the records of cases, the service currently throws an error if the user attempts to arrange an appointment with that user. This functionally replicates the protections afforded by Delius’s RBAC model.

Wherever supported, we will pass the identity of the logged-in user to Community API endpoints so that NDelius can perform its permission checks correctly.

## Consequences

We consider the risk of a pilot participant engineering the URL to access a case in our service that they wouldn’t be permitted to access in Delius (if such a thing exists) is low enough that we are comfortable with that risk during the pilot phase.

Once we build a part of the service that allows practitioners to access records of cases that are not assigned to them, we will need to decide what actions, if any, they are able to perform on those records. At that point, we may need to replicate Delius’s RBAC within our service, or a different model informed by our own research and design process.
