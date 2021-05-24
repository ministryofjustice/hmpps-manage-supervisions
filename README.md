# HMPPS Manage Supervisions

## Running
The easiest way to run `HMPPS Manage Supervisions` is to use docker compose to create the service and all dependencies. 

```bash
docker-compose pull
docker-compose up
```

This will run with a fake Community API & allow non-Delius user authentication.
If you'd like to run with Delius user based authentication & against the real Community API then run.

```bash
docker-compose -f docker-compose.yml -f docker-compose.community-api.yml up
```

> Warning: this requires access to the private [Oracle DB image](https://github.com/ministryofjustice/hmpps-delius-api/blob/main/doc/development.md#oracle-database)

## Dependencies

`HMPPS Manage Supervisions` requires: 
* redis - session store and token caching
* [hmpps-auth](https://github.com/ministryofjustice/hmpps-auth) - for authentication
* [community-api](https://github.com/ministryofjustice/community-api) - for data access

## Development

To start the main services excluding `HMPPS Manage Supervisions`: 

```bash
docker-compose up redis hmpps-auth fake-api
```

Or with real Community API:

```bash
docker-compose -f docker-compose.yml -f docker-compose.community-api.yml up redis hmpps-auth community-api
```

Install dependencies using `npm install`, ensuring you are using >= `Node v14.x` & `npm v7.x`.

Confirm that the [community API client](#community-api-client) was generated successfully.

```bash
npm run start:dev
```

### Community API client

The community API client at [src/server/community-api/client](src/server/community-api/client) is generated via openapi tools.
This is done on `postinstall` i.e. running `npm install` or can be run manually via `npm run openapi-generate`.

The openapi tools require Java 11+.

### Run linter

```bash
npm run lint
```

### Run tests

```bash
npm run test
```

### Running integration tests

For local running, start redis and a wiremock instance:

```bash
docker-compose -f docker-compose-test.yml up
```

Then run the server in test mode:

```bash
npm run build
npm run start:e2e

# or to run from source:
npm run start:e2e:dev
```

Then run tests in headless mode:

```bash
npm run test:e2e

# or to run with Cyprus UI:
npm run test:e2e-ui
```

### Dependency Checks

The template project has implemented some scheduled checks to ensure that key dependencies are kept up to date.
If these are not desired in the cloned project, remove references to `check_outdated` job from `.circleci/config.yml`
