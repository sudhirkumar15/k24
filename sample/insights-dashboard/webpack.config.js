'use strict';

const webpack                     = require('webpack'),
    path                          = require('path'),
    ExtractTextPlugin             = require('extract-text-webpack-plugin'),
    CleanWebpackPlugin            = require('clean-webpack-plugin'),
    AssetsPlugin                  = require('assets-webpack-plugin'),
    Md5Hash                       = require('webpack-md5-hash'),
    OfflinePlugin                 = require('offline-plugin'),
    BundleAnalyzerPlugin          = require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
    LodashModuleReplacementPlugin = require('lodash-webpack-plugin'),
    ProgressBarPlugin             = require('progress-bar-webpack-plugin');

module.exports = {
    cache: true,
    entry: {
        'landing'         : path.resolve(__dirname, 'web/static/js/landing'),
        'dashboard'       : path.resolve(__dirname, 'web/static/js/dashboard'),
        'event'           : path.resolve(__dirname, 'web/static/js/event'),
        'retention'       : path.resolve(__dirname, 'web/static/js/retention'),
        'funnel'          : path.resolve(__dirname, 'web/static/js/funnel'),
        'bookDashboard'   : path.resolve(__dirname, 'web/static/js/bookDashboard'),
        'bookActivity'    : path.resolve(__dirname, 'web/static/js/bookActivity'),
        'bookDailyReport' : path.resolve(__dirname, 'web/static/js/bookDailyReport'),
        'pdfHeatmap'      : path.resolve(__dirname, 'web/static/js/pdfHeatmap'),
        'epubHeatmap'     : path.resolve(__dirname, 'web/static/js/epubHeatmap'),
        'userDashboard'   : path.resolve(__dirname, 'web/static/js/userDashboard'),
        'userActivity'    : path.resolve(__dirname, 'web/static/js/userActivity'),
        'userDailyReport' : path.resolve(__dirname, 'web/static/js/userDailyReport'),
        'vendor'    : [
            'jquery',
            'highcharts',
            'highcharts/modules/exporting',
            'bootstrap/js/tooltip',
            'datatables.net-responsive',
            'datatables.net-responsive-bs',
            'lodash/map',
            'lodash/forEach',
            'lodash/uniq',
            'lodash/head',
            'lodash/reduce',
            'lodash/flatten',
            'lodash/indexOf',
            'lodash/slice',
            'lodash/upperCase',
            'qs',
            'moment',
            'chosen-npm/public/chosen.jquery',
            'js-cookie',
            'bootstrap-daterangepicker',
            'nprogress',
            'plugin',
            'common',
            'datePicker',
            'handlebars/runtime',
        ]
    },
    output: {
        path         : path.resolve(__dirname, 'web/static/build'),
        filename     : '[name].[chunkhash].js',
        chunkFilename: '[name].[chunkhash].js',
        publicPath   : '/static/build/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                   path.resolve(__dirname, 'web/static/js'),
                ],
                loader: 'babel-loader',
                query: {
                    presets: [['es2015', {modules: false}]],
                    plugins: ['lodash'],
                    cacheDirectory: true
                }
            },
            {
                test  : /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                discardComments: {
                                    removeAll: true
                                }
                            }
                        },
                    ]
                }),
            },
            {
                test  : /\.(woff|woff2|svg|ttf|eot)([\?]?.*)$/,
                loader: 'file-loader?name=[name].[hash].[ext]'
            },
            {
                test  : /\.(png|gif|jpe?g)$/i,
                loader: 'file-loader?name=[name].[hash].[ext]'
            },
            {
                test: /\.hbs$/,
                loader: 'handlebars-loader?runtime=handlebars/runtime',
                include: [
                    path.resolve(__dirname, 'web/static/views/partials'),
                ]
            }
        ]
    },
    plugins: [
        new ProgressBarPlugin(),
        new CleanWebpackPlugin(['web/static/build'], {
            verbose: true, // log to console
            dry    : false // true for testing
        }),
        new LodashModuleReplacementPlugin({
            'collections': true,
            'shorthands': true
        }),
        new Md5Hash(),
        new ExtractTextPlugin('[name].[contenthash].css'),
        new webpack.ProvidePlugin({
            $     : 'jquery', // expose $ and jquery globally
            jQuery: 'jquery'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename:'[name].[chunkhash].js',
            minChunks: Infinity
        }),
        new webpack.NamedModulesPlugin(),
        new AssetsPlugin({
            prettyPrint: true,
            filename   : 'assets.json'
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10000}),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: true,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                join_vars: true,
                if_return: true
            },
            output: {
                comments: false
            }
        }),
        new webpack.DefinePlugin({
            'process.env': {NODE_ENV: JSON.stringify('production')}
        }),
        new OfflinePlugin({
            publicPath: '/static/build/',
            publicLocation: '/static/build/sw.js',
            ServiceWorker: {
                scope: './'
            },
            externals: [
                'https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,300italic,400italic,600italic',
                'https://fonts.gstatic.com/s/sourcesanspro/v9/ODelI1aHBYDBqgeIAH2zlNV_2ngZ8dMf8fLgjYEouxg.woff2',
                'https://fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGEo0As1BFRXtCDhS66znb_k.woff2',
                '/static/thirdparty/chosen/chosen.css',
                '/static/thirdparty/chosen/chosen-sprite.png',
                '/static/css/dark.css',
                '/static/images/ipc.png',
                '/static/images/logo_sm.png',
            ]
        }),
        new BundleAnalyzerPlugin(),
    ],
    resolve: {
        modules: [
            'node_modules',
            'web/static/js',
        ],
        extensions: ['.js', '.json', '.css', '.hbs'],
    },
    node: {
        fs: 'empty'
    }
};
