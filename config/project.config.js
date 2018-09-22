/* eslint key-spacing:0 spaced-comment:0 */
const path = require('path')
const debug = require('debug')('app:config:project')
const argv = require('yargs').argv
const ip = require('ip')
const serviceUrls = require("./service.url.js");

const sourceMap = true;

debug('Creating default configuration.')
// ========================================================
// Default Configuration
// ========================================================
const config = {
    env: process.env.NODE_ENV || 'development',
    service: process.env.SERVICE || 'local',
    // ----------------------------------
    // Project Structure
    // ----------------------------------
    path_base: path.resolve(__dirname, '..'),
    dir_client: 'src',
    dir_dist: 'dist',
    dir_public: 'public',
    dir_server: 'server',
    dir_renderer: 'renderer',
    dir_test: 'tests',

    // ----------------------------------
    // Server Configuration
    // ----------------------------------
    server_host: ip.address(), // use string 'localhost' to prevent exposure on local network
    server_port: process.env.PORT || 9095,

    // ----------------------------------
    // Compiler Configuration
    // ----------------------------------
    compiler_babel: {
        cacheDirectory: true,
        plugins: ['@babel/transform-runtime', 'lodash'
        ],
        presets: ['@babel/preset-env', '@babel/preset-react']
    },
    compiler_devtool: sourceMap ? 'cheap-module-source-map' : 'eval',
    compiler_hash_type: 'hash',
    compiler_fail_on_warning: false,
    compiler_quiet: false,
    compiler_public_path: '/',
    compiler_stats: {
        chunks: false,
        chunkModules: false,
        colors: true
    },
    compiler_vendors: [
        'react',
        'react-dom',
        'react-redux',
        'react-router',
        'react-router-dom',
        'react-modal',
        'redux',
        'moment',
        'babel-polyfill',
        'classnames',
        'react-dates',
    ],

    // ----------------------------------
    // Test Configuration
    // ----------------------------------
    coverage_reporters: [
        {type: 'text-summary'},
        {type: 'lcov', dir: 'coverage'}
    ]
}

/************************************************
 -------------------------------------------------

 All Internal Configuration Below
 Edit at Your Own Risk

 -------------------------------------------------
 ************************************************/

// ------------------------------------
// Environment
// ------------------------------------
// N.B.: globals added here must _also_ be added to .eslintrc
config.globals = {
    'process.env': {
        'NODE_ENV': JSON.stringify(config.env)
    },
    'SERVICE_URL': JSON.stringify(serviceUrls[config.service]),
    'TOAD_SERVICE_URL': JSON.stringify(serviceUrls["toad_" + config.service]),
    'SIGN_SERVICE_URL': JSON.stringify(serviceUrls["sign_" + config.service]),
    'NODE_ENV': config.env,
    '__DEV__': config.env === 'development',
    '__PROD__': config.env === 'production',
    '__RENDER__': config.env === 'renderer',
    '__TEST__': config.env === 'test',
    '__COVERAGE__': !argv.watch && config.env === 'test',
    '__BASENAME__': JSON.stringify(process.env.BASENAME || '')
}
// ------------------------------------
// Validate Vendor Dependencies
// ------------------------------------
const pkg = require('../package.json')

config.compiler_vendors = config.compiler_vendors
    .filter((dep) => {
        if (pkg.dependencies[dep]) return true

        debug(
            `Package "${dep}" was not found as an npm dependency in package.json; ` +
            `it won't be included in the webpack vendor bundle.
       Consider removing it from \`compiler_vendors\` in ~/config/index.js`
        )
    })

// ------------------------------------
// Utilities
// ------------------------------------
function base() {
    const args = [config.path_base].concat([].slice.call(arguments))
    return path.resolve.apply(path, args)
}

config.paths = {
    base: base,
    client: base.bind(null, config.dir_client),
    renderer: base.bind(null, config.dir_renderer),
    public: base.bind(null, config.dir_public),
    dist: base.bind(null, config.dir_dist)
}

// ========================================================
// Environment Configuration
// ========================================================
debug(`Looking for environment overrides for NODE_ENV "${config.env}".`)
const environments = require('./environments.config')
const overrides = environments[config.env]
if (overrides) {
    debug('Found overrides, applying to default configuration.')
    Object.assign(config, overrides(config))
} else {
    debug('No environment overrides found, defaults will be used.')
}

module.exports = config
