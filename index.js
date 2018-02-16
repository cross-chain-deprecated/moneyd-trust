const parentBtpHmacKey = 'parent_btp_uri'
const BTP_NAME = process.env.BTP_NAME || ''
const PARENT_BTP_HOST = process.env.PARENT_BTP_HOST

if (!PARENT_BTP_HOST) {
  console.error('--parent must be defined')
  process.exit(1)
}

const Connector = require('ilp-connector')
const crypto = require('crypto')
const hmac = (key, message) => {
  const h = crypto.createHmac('sha256', key)
  h.update(message)
  return h.digest()
}

const btpSecret = hmac(hmac(parentBtpHmacKey, PARENT_BTP_HOST + BTP_NAME), crypto.randomBytes(32)).toString('hex')
const parentUri = 'btp+wss://' + BTP_NAME + ':' + btpSecret + '@' + PARENT_BTP_HOST

const connector = Connector.createApp({
  spread: 0,
  backend: 'one-to-one',
  store: 'ilp-store-memory',
  initialConnectTimeout: 60000,
  accounts: {
    parent: {
      relation: 'parent',
      plugin: 'ilp-plugin-btp',
      assetCode: 'USD',
      assetScale: 6,
      balance: {
        minimum: '-Infinity',
        maximum: '20000',
        settleThreshold: '5000',
        settleTo: '10000'
      },
      options: {
        server: parentUri
      }
    },
    local: {
      relation: 'child',
      plugin: 'ilp-plugin-mini-accounts',
      assetCode: 'XRP',
      assetScale: 6,
      balance: {
        minimum: '-Infinity',
        maximum: 'Infinity',
        settleThreshold: '-Infinity'
      },
      options: {
        wsOpts: {
          host: 'localhost',
          port: 7768
        },
        allowedOrigins: JSON.parse(process.env.ALLOW_ORIGIN)
      }
    }
  },
  routes: [{
    targetPrefix: 'g.',
    peerId: 'parent'
  }]
})

connector.listen()
  .catch(e => {
    console.error('fatal:', e)
    process.exit(1)
  })
