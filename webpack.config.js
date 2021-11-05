const path = require('path');
const { Compilation } = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const SentryPlugin = require("@sentry/webpack-plugin");
const { readFile } = require('fs/promises')

const { BUILD_NUMBER: buildNumber = null, GIT_REF: gitRef = null } = process.env;

async function getApiSpecVersions() {
  const json = await readFile('openapitools.json', { encoding: 'utf8' })
  const specs = await Promise.all(
    Object.entries(JSON.parse(json)['generator-cli'].generators)
      .map(async ([name, meta]) => ({ name, spec: await readFile(path.resolve(__dirname, meta.glob), { encoding: 'utf8' }) }))
  )

  return specs.reduce((agg, x) => ({ ...agg, [x.name]: JSON.parse(x.spec).info.version }), {})
}

class WriteBuildInfoPlugin {
  plugin = { name: 'WriteBuildInfo' };

  apply(compiler) {
    compiler.hooks.compilation.tap(this.plugin, compilation => {
      compilation.hooks.processAssets.tapPromise(
        { name: this.plugin.name, stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        async assets => {
          const apiSpecVersions = await getApiSpecVersions()
          const json = JSON.stringify({ buildNumber, gitRef, apiSpecVersions });
          assets['build-info.json'] = { source: () => json, size: () => json.length };
        },
      );
    });
  }
}

function serverOptions(options) {
  return {
    ...options,
    devtool: 'source-map',
    plugins: [
      ...options.plugins,
      new CopyPlugin({
        patterns: [
          {
            from: '**/*.(njk|html)',
            to: 'views',
            context: path.resolve(__dirname, 'src', 'server', 'views'),
          },
          {
            from: '**/*.(njk|html)',
            to: 'views',
            context: path.resolve(__dirname, 'node_modules', 'govuk-frontend'),
          },
          {
            from: '**/*.(njk|html)',
            to: 'views',
            context: path.resolve(__dirname, 'node_modules', '@ministryofjustice', 'frontend'),
          },
          {
            from: '!(views)/**/*.njk',
            to: 'views',
            context: path.resolve(__dirname, 'src', 'server'),
          },
        ],
      }),
      new WriteBuildInfoPlugin(),
      new SentryPlugin({
        include: './dist/main.*',
        ignore: ['assets'],
        org: 'ministryofjustice',
        project: 'hmpps-manage-supervisions',
        release: buildNumber || 'unknown',
        // only create a release from CI on the main branch
        dryRun: !buildNumber || !process.env.CI || process.env.GIT_BRANCH !== 'main',
      }),
    ],
  }
}

module.exports = serverOptions;
