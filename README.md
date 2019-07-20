# sqs-probe

Test your service performance using Amazon SQS.

> VERSION ON NPM HASN'T PUBLISHED YET.
>
> IF YOU WANNA TO TEST CLONE THIS REPOSITORY AND RUN INDEX.JS WITH ARGUMENTS OR ADD .ENV FILE.


- [sqs-probe](#sqs-probe)
  - [Install](#Install)
  - [Run script](#Run-script)
  - [Options](#Options)
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

## Options

| Option             | ENV                        | Description                      |
| ------------------ | -------------------------- | -------------------------------- |
| `--aws-key-id`     | `SQS_PROBE_AWS_KEY_ID`     | AWS Key Id                       |
| `--aws-secret-key` | `SQS_PROBE_AWS_SECRET_KEY` | AWS Secret Key                   |
| `--aws-role-arn`   | `SQS_PROBE_AWS_ROLE_ARN`   | AWS Role Arn                     |
| `--aws-region`     | `SQS_PROBE_AWS_REGION`     | AWS Region                       |
| `--queue-request`  | `SQS_PROBE_QUEUE_REQUEST`  | Request SQS queue name           |
| `--queue-response` | `SQS_PROBE_QUEUE_RESPONSE` | Response SQS queue name          |
| `-t, --times`      | `SQS_PROBE_TIMES`          | How many messages should be sent |

> ENV Variables has higher priority over CLI arguments.

## Contribution

I appreciate every contribution, just fork the repository and send the pull request with your changes.

## Requirements

- Node.js >= 8