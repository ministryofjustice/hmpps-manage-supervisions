const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: {
    'assets/client': './src/client/main.ts',
  },
  target: ['web', 'es5'],
  devtool: 'source-map',
  optimization: {
    minimizer: [
      '...',
      new CssMinimizerPlugin(),
    ]
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // using fork-ts-checker-webpack-plugin instead
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
    new CopyPlugin({
      patterns: [
        { from: 'node_modules/govuk-frontend/govuk/assets', to: 'assets' },
        { from: 'node_modules/@ministryofjustice/frontend/moj/assets', to: 'assets' },
        { from: 'src/client/assets', to: 'assets' },
      ],
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: 'tsconfig.client.json',
      },
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
};