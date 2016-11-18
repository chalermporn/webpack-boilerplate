import path from 'path'
import webpack from 'webpack'
import webpackMerge from 'webpack-merge'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import ManifestPlugin from 'webpack-manifest-plugin'
import InlineManifestWebpackPlugin from 'inline-manifest-webpack-plugin'

import webpackConfigBase from './config.base.babel'
import {projectRootPath, projectSourcePath, templatePath} from '../config'

export default webpackMerge(webpackConfigBase, {
  devtool: 'source-map',
  entry: {
    app: path.join(projectSourcePath, 'app/main.js'),
    vendor: ['react']
  },
  output: {
    publicPath: '/',
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js'
  },
  module: {
    loaders: [
      {
        test: /\.css/,
        loader: ExtractTextPlugin.extract('css-loader?sourceMap!postcss-loader')
      }, {
        test: /\.scss/,
        loader: ExtractTextPlugin.extract('css-loader?sourceMap!postcss-loader!sass-loader?sourceMap')
      }
    ]
  },
  plugins: [
    // define free variables
    // https://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    // OccurrenceOrderPlugin is needed for long-term caching to work properly
    // see http://mxs.is/googmv
    new webpack.optimize.OccurrenceOrderPlugin(),
    // merge all duplicate modules
    new webpack.optimize.DedupePlugin(),
    // minify and optimize the javaScript
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compress: {
        warnings: false
      }
    }),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: 2
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    // extract the CSS into a separate file
    new ExtractTextPlugin('static/css/[name].[contenthash:8].css'),
    // minify and optimize the index.html
    new HtmlWebpackPlugin({
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency',
      inject: true,
      template: templatePath,
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
    // https://www.npmjs.com/package/inline-manifest-webpack-plugin
    new InlineManifestWebpackPlugin({
        name: 'vendorManifest'
    }),
    // this will generate a assets-manifest.json file
    // in the output file you can see all assets' paths
    new ManifestPlugin({
      fileName: 'assets-manifest.json',
      basePath: '/'
    })
  ]
})
