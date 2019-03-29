# Stork

Static site generator based on Parcel, Pug, Typescript and SASS

## CLI

<!-- toc -->
* [Stork](#stork)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g stork
$ stork COMMAND
running command...
$ stork (-v|--version|version)
stork/1.0.0 darwin-x64 node-v10.15.3
$ stork --help [COMMAND]
USAGE
  $ stork COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`stork build`](#stork-build)
* [`stork help [COMMAND]`](#stork-help-command)

## `stork build`

builds static site source files into a HTML/asset bundle

```
USAGE
  $ stork build

OPTIONS
  -h, --help       show CLI help
  -p, --path=path  path to site source

EXAMPLE
  $ stork build
  ✨  Built in 358ms.
```

_See code: [dist/commands/build.ts](https://github.com/peakwinter/stork/blob/v1.0.0/dist/commands/build.ts)_

## `stork help [COMMAND]`

display help for stork

```
USAGE
  $ stork help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_
<!-- commandsstop -->
