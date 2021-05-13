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
          'accessible-autocomplete'
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
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'assets/fonts/',
              },
            },
          ],
        },
        {
          test: /\.(png|jp(e)?g)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'assets/images/',
              },
            },
          ],
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
        ],
      }),
    ],
  };
};
