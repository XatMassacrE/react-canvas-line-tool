const path = require('path');
const webpack = require('webpack');
const HtmlwebpackPlugin = require('html-webpack-plugin');

const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, 'src');
const BUILD_PATH = path.resolve(ROOT_PATH, '/dist/assets');
const TEM_PATH = path.resolve(ROOT_PATH, 'template');

const config = {
  devtool: 'eval-source-map',
  entry: {
    app: path.resolve(APP_PATH, 'index.js'),
    // test: path.resolve(APP_PATH, 'test.js')
    // need to bundle package
    // vendors: ['jquery', 'momnet']
  },
  output: {
    path: BUILD_PATH,
    // this [name] will be defined by -entry->name
    filename: '[name].js',
    publicPath: '/assets/'
  },

  plugins: [
    new HtmlwebpackPlugin({
      title: 'gallery-react-webpack app',
      template: path.resolve(TEM_PATH, 'index.html'),
      filename: 'index.html',
      chunks: ['app', 'venders'],
      inject: 'body'
    }),
    // new HtmlwebpackPlugin({
    //   title: 'gallery-react-webpack test',
    //   template: path.resolve(TEM_PATH, 'test.html'),
    //   filename: 'test.html',
    //   chunks: ['test', 'venders'],
    //   inject: 'body'
    // }),
    // put jquery... as a global variables
    // new webpack.ProvidePlugin({
    //   $: 'jquery',
    //   jQuery: 'jquery',
    //   'window.jQuery': 'jquery'
    // })
  ],
  module: {
    preloaders: [
      {
        test: /\.js?$/,
        include:APP_PATH,
        loader: 'jshint-loader'
      }
    ],
    loaders: [
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass'],
        include: APP_PATH
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'file-loader?name=images/[hash].[ext]'
      },
      {
        test: /\.js?$/,
        loader: 'babel',
        include: APP_PATH,
        //loaders: ['react-hot', 'babel?presets[]=react,presets[]=es2015']
        query: {
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  // support es6 hint
  jshint: {
    'esnext': true
  },
  devServer: {
    contentBase: './src/',
    publicPath: '/assets/',
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
    proxy: {
      '/api/v1/*': {
        target: 'http://localhost:8081',
        secure: false
      }
    }
  }
}

module.exports = config;