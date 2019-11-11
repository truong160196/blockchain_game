const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const PackageJson = require('./package.json');

const { build } = PackageJson;

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';

  return {
    mode: devMode,
    devtool: 'inline-source-map',
    performance: {
      hints: false,
      maxEntrypointSize: 500000,
    },
    entry: {
    // All App source files will be compiled into main
      app: './src/index.jsx',

      // All vendor files will be compiled into vendor.
      vendor: [
        '@babel/polyfill',
        'react',
        'react-dom',
        'react-router-dom',
      ],
    },
    devServer: {
      historyApiFallback: true,
      noInfo: false,
      contentBase: '/public',
      host: 'localhost',
      hot: false,
      open: false,
      inline: false,
      disableHostCheck: true,
    },
    module: {
      rules: [
      // Transpile all .js and .jsx files
        {
          test: /\.(jsx)?$/,
          exclude: [/(node_modules)/, /(workers)/],
          use: [{
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/react',
                '@babel/env',
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                [
                  '@babel/plugin-proposal-decorators', {
                    legacy: true,
                  },
                ],
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-syntax-dynamic-import',
              ],
            },
          }, 'eslint-loader'],
        },
        {
          test: /\.(js)?$/,
          exclude: /(node_modules)/,
          use: [{
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/react',
                '@babel/env',
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                [
                  '@babel/plugin-proposal-decorators', {
                    legacy: true,
                  },
                ],
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-syntax-dynamic-import',
              ],
            },
          }],
        },
        {
          test: /\.worker\.(jsx)?$/,
          exclude: /(node_modules)/,
          use: [
            {
              loader: 'worker-loader',
              options: {
                inline: true,
                fallback: false,
              },
            }],
        },
        // Compile CSS files
        {
          test: /\.css$/,
          use: ['css-hot-loader', MiniCssExtractPlugin.loader, 'css-loader'],
        },

        // Compile SCSS files
        {
          test: /\.scss$/,
          use: [
            'css-hot-loader',
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
            },
            {
              loader: 'postcss-loader',
            },
            {
              loader: 'sass-loader',
            },
          ],
        },

        // Copy static assets over with file-loader
        {
          test: /\.(ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader',
          options: {
            name: 'assets/fonts/[name].[ext]',
          },
        },
        {
          test: /\.(jpg|gif|png|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader',
          options: {
            name: 'assets/images/[name].[ext]',
          },
        },
        {
          test: /\.(json)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader',
          exclude: /(node_modules)/,
          options: {
            name: 'assets/json/[name].[ext]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['*', '.js', '.jsx'],
      alias: {
      },
    },
    plugins: [
      new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['!favicon.ico', '!assets/images/*.*'], verbose: true }),
      new webpack.HashedModuleIdsPlugin(),

      new webpack.EnvironmentPlugin({ ...process.env }),
      // Inject the build date as an environment variable
      new webpack.DefinePlugin({
        'process.env': {
          BUILD_DATE: JSON.stringify(new Date()),
          API_VERSION_ENV: JSON.stringify(build),
          NODE_ENV: JSON.stringify('production'),
          MODE: JSON.stringify(argv.mode),
        },
      }),
      //
      new Dotenv({
        path: `${__dirname}/.env`,
        safe: true,
        systemvars: true,
        silent: true,
        defaults: false,
      }),
      // Inject the required assets into the template index file
      new HTMLWebpackPlugin({
        filename: 'index.html',
        template: 'src/template/index.html',
      }),

      // Copy public files into the public folder
      new CopyWebpackPlugin([{
        from: 'src/teamplate/assets/*',
      }]),
      new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
        filename: devMode ? 'assets/css/[name].css' : `assets/css/${build}.[name].[hash].css`,
        chunkFilename: devMode ? 'assets/css/[id].css' : `assets/css/${build}.[id].[hash].css`,
      }),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
      runtimeChunk: true,
    },
    output: {
      path: `${__dirname}/public`,
      filename: devMode ? 'assets/js/[name].js' : `assets/js/${build}.[name].[hash].js`,
      chunkFilename: devMode ? 'assets/js/[name].js' : `assets/js/${build}.[name].[hash].js`,
      publicPath: '/',
    },
  };
};