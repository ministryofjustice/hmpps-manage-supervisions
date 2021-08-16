# Nestjs

This application is built on top of [nestjs](https://nestjs.com/).

## Modules

Features should be separated into nestjs modules where appropriate with all dependent components e.g. services & views collocated.
To avoid a routing mess, no inter-feature dependencies should be created.
Instead, shared components should be separated into one of the shared modules:

* `common` - can be included in any other module, so to avoid circular dependencies, importing any other module is not recommended.
* `security` - is imported into the root app module only & since it includes security routing e.g. `/login` & `/logout`, should only be consumed by other modules indirectly, i.e. through route meta.
* `config` - this is not a nest module, it is instead consumed by any module via the [nest configuration api](https://docs.nestjs.com/techniques/configuration).
* the generated APIs - we use the [typescript-axios](https://github.com/OpenAPITools/openapi-generator/blob/master/docs/generators/typescript-axios.md) openapi generator for our API clients as the [typescript-nestjs](https://github.com/OpenAPITools/openapi-generator/blob/master/docs/generators/typescript-nestjs.md) generator (Aug-2021) does not support OAuth 2.0.
  Each generated client is wrapped in a nestjs module, which are also a useful place to provide any shared, domain specific logic that is not suitable to be shared from the common module e.g. it has a dependency on the generated API client.

## CLI

To remain compliant with the established application structure, you should use the [nest CLI](https://docs.nestjs.com/cli/overview) for scaffolding new application components.
