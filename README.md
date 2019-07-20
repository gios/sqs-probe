# sqs-probe

Test your service performance using Amazon SQS.


- [sqs-probe](#sqs-probe)
  - [Install](#Install)
  - [Run script](#Run-script)
  - [Contribution](#Contribution)
  - [Requirements](#Requirements)

## Install

`npm i sqs-probe -g`

or locally to devDependencies

`npm i sqs-probe -D`

or globally

`npm i sqs-probe -g`

## Run script

Globally usage.

`sqs-probe <config_file_path> [options]`

Locally usage.

- add to scripts in your package.json

```
  "scripts": {
    ...
    "sqs-probe": "sqs-probe"
  }
```

- or use `npx` command

`npx sqs-probe ./config.json --times 2`

## Contribution

I appreciate every contribution, just fork the repository and send the pull request with your changes.

## Requirements

- Node.js >= 8