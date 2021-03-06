#!/usr/bin/env node
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const fetch = require('node-fetch')
const DEFAULT_CONFIG = path.join(process.env.HOME, '.moneyd.json')
const DEFAULT_TESTNET_CONFIG = path.join(process.env.HOME, '.moneyd.test.json')
const banner = chalk.green(`                                                                           88
                                                                           88
                                                                           88
88,dPYba,,adPYba,   ,adPPYba,  8b,dPPYba,   ,adPPYba, 8b       d8  ,adPPYb,88
88P'   "88"    "8a a8"     "8a 88P'   \`"8a a8P_____88 \`8b     d8' a8"    \`Y88
88      88      88 8b       d8 88       88 8PP"""""""  \`8b   d8'  8b       88
88      88      88 "8a,   ,a8" 88       88 "8b,   ,aa   \`8b,d8'   "8a,   ,d88
88      88      88  \`"YbbdP"'  88       88  \`"Ybbd8"'     Y88'     \`"8bbdP"Y8
                                                          d8'
                                                         d8'`)

require('yargs')
  .option('config', {
    alias: 'c',
    default: DEFAULT_CONFIG,
    description: 'JSON config file'
  })
  .option('unsafe-allow-extensions', {
    type: 'boolean',
    default: false,
    description: 'Whether to accept connections from arbitrary browser extensions (Warning: this is unsafe)'
  })
  .option('allow-origin', {
    type: 'string',
    description: 'Accept connections from the indicated origin'
  })
  .option('testnet', {
    alias: 't',
    type: 'boolean',
    default: false,
    description: 'Whether to use the testnet config file'
  })
  .command('local', 'launch moneyd with no uplink into the network, for local testing', {}, argv => {
    console.log('launching local moneyd...')
    require('./local')
  })
  .command('start', 'launch moneyd', {
    quiet: {
      alias: 'q',
      type: 'boolean',
      default: false,
      description: 'Don\'t print the banner on startup.'
    }
  }, argv => {
    const origins = []
      .concat(argv['allow-origin'] || [])
      .concat(argv['unsafe-allow-extensions'] ? 'chrome-extension://.*' : [])
    process.env.ALLOW_ORIGIN = JSON.stringify(origins)

    if (argv.testnet && argv.config === DEFAULT_CONFIG) {
      argv.config = DEFAULT_TESTNET_CONFIG
    }

    if (!fs.existsSync(argv.config)) {
      console.error('config file does not exist. file=' + argv.config)
      process.exit(1)
    }

    const config = JSON.parse(fs.readFileSync(argv.config).toString())
    process.env.BTP_NAME = config.name || ''
    process.env.PARENT_BTP_HOST = config.parent || ''

    if (!argv.quiet) {
      console.log(banner)
    }

    console.log('set environment; starting moneyd')
    require('..')
  })
  .command('configure', 'generate a configuration file', {
    parent: {
      description: 'BTP host of your parent connector, e.g. "client.scyl.la"'
    },
    name: {
      default: '',
      description: 'Name to assign to this channel. Must be changed if other parameters are changed.'
    }
  }, async argv => {
    if (!argv.config) {
      console.error('config file to output must be specified (--config)')
      process.exit(1)
    }

    if (argv.testnet) {
      if (argv.config === DEFAULT_CONFIG) {
        console.log('setting config file location to ' + DEFAULT_TESTNET_CONFIG)
        argv.config = DEFAULT_TESTNET_CONFIG
      }
    }

    if (fs.existsSync(argv.config)) {
      console.error('config file already exists. file=' + argv.config)
      process.exit(1)
    }

    if (!argv.parent) {
      console.log('selecting a parent from connector list...')
    }

    const list = require('../connector_list.json')
    const servers = list[argv.testnet ? 'test' : 'live']
    const parent = argv.parent || servers[Math.floor(Math.random() * servers.length)]

    const config = {
      parent
    }

    if (argv.name) {
      config.name = argv.name
    }

    if (argv.address) {
      config.address = argv.address
    }

    console.log('writing config file...')
    fs.writeFileSync(argv.config, JSON.stringify(config, null, 2))
    console.log('written to', argv.config)
  })
  .command('*', '', {}, argv => {
    console.error('unknown command.')
    process.exit(0)
  })
  .argv
