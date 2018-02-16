# Moneyd
> ILP-enable your machine!

- [Quickstart](#quick-start)
  - [Test Network](#test-network)
  - [Live Network](#live-network)
  - [Local Test Network](#local-test-network)
- [Description](#description)
- [Advanced Usage](#usage)
  - [Command-Line Options](#command-line-options)
  - [Remote Deploy](#remote-deploy)
  - [Reconciliation](#settlement)
  - [Account Info](#account-info)
  - [Clean Up Channels](#clean-up-channels)
  - [Multiple Instances](#multiple-instances)
- [Sending Payments](#sending-payments)
- [Connector List](#connector-list)

## Quick Start

You can follow the [Testnet](#test-network) instructions. For development in an offline
environment, you can run your own [Local Testnet](#local-test-network). 

### Test Network

You'll need:

- Node v8.9.4 or higher.
- Permissions to install global node modules.

```sh
npm install -g moneyd
moneyd configure --testnet
moneyd start --testnet
```

A configuration file will be created in `~/.moneyd.test.json`.

So long as that command is running, you'll have access to ILP via port 7768.
The [Sending Payments](#sending-payments) section describes servers on the live
network right now, but will soon be updated to include examples that you can
try from the test network.

### Live Network

You'll need:

- Node v8.9.4 or higher.
- Permissions to install global node modules.

Just run:

```sh
npm install -g moneyd
moneyd configure
moneyd start
```

A configuration file will be created in `~/.moneyd.json`.

So long as that command is running, you'll have access to ILP via port 7768.
For some commands you can do, look at [Sending Payments](#sending-payments).
For more advanced usage of the moneyd command, look at [Advanced Usage](#advanced-usage).

### Local Test Network

If you're just doing local development, you may not care about being connected
to any network.  Moneyd allows you to run an isolated local test network for
this scenario. Run:

```
npm install -g moneyd
moneyd local
```

This exposes ILP access via port 7768, but any application connected to this
port will only be able to pay other applications on the same machine.

## Description

This repo contains an experimental ILP provider, allowing all applications on
your computer to use funds on the _live_ ILP network.

It works by creating a payment channel to an Interledger connector, and then
running `ilp-plugin-mini-accounts` locally. Any plugin can connect to this
mini-accounts instance by generating a random secret and authenticating via BTP
to `localhost:7768`. By default, only connections from localhost are accepted.

The `ilp-plugin` repo is already designed to do this, so `ilp-curl` and many
other tools will work right out of the box.

## Advanced Usage

### Command-Line Options

For any of the commands below, you can use a config file in a non-standard
location with `-c`. If you have configured your moneyd instance with
`--testnet`, then you should also add the `--testnet` flag to any commands
specified in this section.

To view a complete list of the moneyd flags, run:

```
moneyd help
```

If you want to see the options for a specific command, pass `--help`. For example:

```
moneyd configure --help
```

### Remote Deploy

If you did the previous step on your remote server, then you don't need to run any
special software to get moneyd on your local machine. Not only that, but you can
grant access to Interledger to as many machines as you want!

Just forward the moneyd port `7768` to any machine where you want ILP access by
using SSH local port forwarding:

```sh
ssh -N -L 7768:localhost:7768 user@example.com
```

Replace the `user@example.com` with the server on which you're running moneyd.

## Multiple Instances

Sometimes you want to run several instances of moneyd with for the same parent connector.

In order to distinguish your instances of moneyd, set (or change) the `"name"`
field in your `~/.moneyd.json`. This `"name"` will be a segment of your ILP
address, so it must only use `[A-Za-z0-9\-_~]`. The `"name"` must be unique per
parent BTP host.

```json
{
  "parent": "your_parent_host",
  "name": "example-user"
}
```

You can use as many different `"name"`s as you want.

## Sending Payments

Now that you have moneyd running, you can test it out by uploading a file to unhash.
Unhash is a simple content-addressed file upload service based on ILP.

You'll use [ILP Curl](https://github.com/interledgerjs/ilp-curl), which will connect
to moneyd and send money to the unhash host.

```sh
npm install -g ilp-curl
echo "This is my example file" > example.txt
ilp-curl -X POST https://alpha.unhash.io/upload --data @example.txt
# --> {"digest":"ff5574cef56e644f3fc4d0311b15a3e95f115080bcc029889f9e32121fd60407"}
curl https://alpha.unhash.io/ff5574cef56e644f3fc4d0311b15a3e95f115080bcc029889f9e32121fd60407
# --> "This is my example file"
```

Now you've successfully sent an ILP payment to pay for a file upload!  Another
way to use ILP is with SPSP, the simple payment setup protocol. This next
example will send a micropayment to `$sharafian.com`.

```sh
npm install -g ilp-spsp
ilp-spsp send --receiver \$sharafian.com --amount 100
# --> paying 100 to "$sharafian.com"...
# --> sent!
```

You can browse [Interledgerjs on Github](https://github.com/interledgerjs) to
find more use cases.

## Connector List

(Submit a PR to add your own connector here)

- `client.scyl.la` - N. Virginia
