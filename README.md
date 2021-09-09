# HMPPS Manage Supervisions

Provides probation practitioners with a GDS UI for managing case load.

* View case load (TODO)
* View offender appointment schedule
* View offender activity log
* View offender risk
* View offender requirement compliance
* View offender personal details
* View offender conviction & sentence
* Arrange an appointment (TODO)

## Running

To run locally with docker compose: 

```bash
docker compose pull
docker compose up --build
```

This will use a stubbed API (via wiremock) & allow non-Delius user authentication.
Navigate to `http://localhost:3000` and login with:

* username: `MANAGE_SUPERVISIONS`
* password: `password123456`

## Dependencies

* redis - session store and token caching
* [hmpps-auth](https://github.com/ministryofjustice/hmpps-auth) - authentication
* [community-api](https://github.com/ministryofjustice/community-api) - Delius data access
* [hmpps-assess-risks-and-needs](https://github.com/ministryofjustice/hmpps-assess-risks-and-needs) - OASys data access

## Development

To start the main services excluding `HMPPS Manage Supervisions`:

```bash
docker compose up redis hmpps-auth wiremock
```

Or with real Community API:

```bash
docker compose -f docker-compose.yml -f docker-compose.community-api.yml up redis hmpps-auth community-api
```

Install dependencies using `npm install`, ensuring you are using >= `Node v14.x` & `npm v7.x`.

Confirm that the [API clients](#generated-api-clients) were generated successfully.

Start the development server on port `3000`:

```bash
npm run start:dev
```

Navigate to `http://localhost:3000` and login as above.

## Nestjs

This application is built on top of [nestjs](https://nestjs.com/).
See the [development documentation](./doc/nestjs.md).

## API mocking

During development & e2e testing, the wiremock instance is seeded from [static mappings](./wiremock), which are generated by the [seed CLI](cypress/plugins/wiremock/cli.ts).
The seed CLI can also update mappings in a running wiremock container:

```bash
npm run seed
```

The e2e tests do this programmatically via `cy.seed({ ...options })`.
Mappings are updated from the static data & fake factories that are referenced from the [seeds plugin](cypress/plugins/seeds.ts) of the cypress project.

Occasionally you may want to generate & commit an updated set of static mappings:

```bash
npm run seed -- --write-mappings
```

The seed CLI provides other potentially useful options, to view them:

```bash
npm run seed -- --help
```

## Generated API clients

Some of our API clients are generated via openapi tools.
See [openapitools.json](./openapitools.json) for details.
This is done on on the `postinstall` step of `npm install` or can be run manually via `npm run openapi-generate`.

The openapi tools require Java 11+.

## Linting

We're using [eslint](https://eslint.org/). Run with:

```bash
npm run lint

# or fix where possible
npm run lint -- --fix
```

CI/CD is set up to fail on any linter warning, so it is useful to have lint-on-save enabled in your IDE and/or install the husky commit hooks:

```bash
npm run prepare
```

## Unit testing

Unit tests are written in [jest](https://jestjs.io/) & are collocated with the application in `*.spec.ts` files. To run all tests:

```bash
npm run test
```

## End-to-end testing

The e2e tests are written in [cypress](https://www.cypress.io/) & depend on wiremock & redis.

```bash
docker compose up wiremock redis
```

The app must be run with the [e2e.env](./e2e.env) configuration. You can do this with:

```bash
npm run start:e2e:dev

# or to run from app build:
npm run build
npm run start:e2e
```

Then run tests in headless mode:

```bash
npm run test:e2e

# or to run with the cypress ui:
npm run test:e2e-ui
```

Once you have run the tests at least once, you can navigate to `http://localhost:3007` to use the app under test.

## Security workflow

The `security` CircleCI workflow is run Mon-Fri @7am off of the `main` branch. It includes:

* `check_outdated` - checks whether specific critical npm packages are outdated, currently: typescript & govuk-frontend.
* [npm-audit](https://docs.npmjs.com/cli/v7/commands/npm-audit) - run a security audit on installed npm packages.
* [trivy](https://github.com/aquasecurity/trivy) - scanner for vulnerabilities in container images, file systems, and Git repositories, as well as for configuration issues.
* [veracode](https://www.veracode.com/products/binary-static-analysis-sast) - proprietary static analysis.
