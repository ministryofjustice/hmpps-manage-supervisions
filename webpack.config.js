const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function (options) {
  return {
    ...options,
    entry: {
      main: options.entry,
      'assets/client': 'src/client/main.ts',
    },
    devtool: 'source-map',
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          include: /client.*/
        }),
        new CssMinimizerPlugin(),
      ],
    },
    externals: [
      nodeExternals({
        allowlist: [
          'jquery',
          'jquery-ui',
          'govuk-frontend',
          '@ministryofjustice/frontend',
          'accessible-autocomplete',
          'timepicker',
        ],
      }),
    ],
    output: {
      filename: '[name].js',
      path: path.join(__dirname, 'dist'),
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.ts$/i,
          include: [path.join(__dirname, 'src', 'server')],
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                configFile: 'tsconfig.build.json',
              },
            },
          ],
        },
        {
          test: /\.ts$/i,
          include: [path.join(__dirname, 'src', 'client')],
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                configFile: 'tsconfig.client.json',
              },
            },
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                implementation: require('sass'),
                sassOptions: { quietDeps: true },
              },
            },
          ],
          type: 'javascript/auto',
        },
        {
          test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name][ext][query]'
          },
        },
        {
          test: /\.(png|jp(e)?g|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name][ext][query]'
          },
        },
      ],
    },
    plugins: [
      ...options.plugins,
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css',
      }),
      new CopyPlugin({
        patterns: [
          { from: 'node_modules/govuk-frontend/govuk/assets', to: 'assets' },
          { from: 'node_modules/@ministryofjustice/frontend/moj/assets', to: 'assets' },
          { from: 'src/client/assets', to: 'assets' },
          { from: 'src/server/views', to: 'views' },
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
    ],
  };
};
