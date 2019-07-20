require("dotenv").config();
const fs = require("fs");
const util = require("util");
const { config, TemporaryCredentials } = require("aws-sdk");
const chalk = require("chalk");
const program = require("commander");
const uuid = require("uuid/v4");

const error = chalk.bold.red;
const info = chalk.cyan;

const readFile = util.promisify(fs.readFile);

const sqsService = require("./sqs-service");
const Listener = require("./listeners");
const { parseJSON } = require("./helpers");

program
  .version(require("./package.json").version)
  .usage("<file> [options]")
  .option("--aws-key-id [awsKeyId]", "AWS Key Id")
  .option("--aws-secret-key [awsSecretKey]", "AWS Secret Key")
  .option("--aws-role-arn [awsRoleArn]", "AWS Role Arn")
  .option("--aws-region [awsRegion]", "AWS Region")
  .option("--queue-request [queueRequest]", "Request SQS queue name")
  .option("--queue-response [awsResponse]", "Response SQS queue name")
  .option("-t, --times [times]", "How many messages should be sent")
  .parse(process.argv);

const [configPath] = program.args;
const awsKeyId = process.env.SQS_PROBE_AWS_KEY_ID || program.awsKeyId;
const awsSecretKey =
  process.env.SQS_PROBE_AWS_SECRET_KEY || program.awsSecretKey;
const awsRoleArn = process.env.SQS_PROBE_AWS_ROLE_ARN || program.awsRoleArn;
const awsRegion = process.env.SQS_PROBE_AWS_REGION || program.awsRegion;
const queueRequest =
  process.env.SQS_PROBE_QUEUE_REQUEST || program.queueRequest;
const awsResponse = process.env.SQS_PROBE_QUEUE_RESPONSE || program.awsResponse;
const times = +process.env.SQS_PROBE_TIMES || +program.times;

try {
  config.update({
    accessKeyId: awsKeyId,
    secretAccessKey: awsSecretKey
  });

  config.credentials = new TemporaryCredentials({
    RoleArn: awsRoleArn
  });
} catch (err) {
  console.log(error("%s (%s) %s"), "AWS", "connection", err);
}

const client = sqsService.getClient(awsRegion);
const messageMap = new Map();

(async () => {
  const requestConfig = parseJSON(await readFile(configPath));
  const messages = [];
  const listener = new Listener(client, messageMap);
  const queueUrl = await sqsService.getQueueUrlPromise(client, {
    QueueName: awsResponse
  });

  listener
    .setQueueUrl(queueUrl)
    .sqsListener()
    .start();

  console.log(info("Started listening the messages..."));

  for (let index = 0; index < times; index++) {
    const id = uuid();
    console.log(
      info("Message with id " + chalk.bold.green(id) + " added to batch")
    );

    messages.push({ ...requestConfig, id });
  }

  await sqsService.sendMessage(client, messages, queueRequest);

  messages.forEach(message =>
    messageMap.set(message.id, { time: process.hrtime(), completed: false })
  );

  console.log(info("------------------------------------------"));
  console.log(info("All messages were added to batch and sent."));
})();
