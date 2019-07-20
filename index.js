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

try {
  config.update({
    accessKeyId: process.env.SQS_PROBE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SQS_PROBE_AWS_SECRET_ACCESS_KEY
  });

  config.credentials = new TemporaryCredentials({
    RoleArn: process.env.SQS_PROBE_AWS_ROLE_ARN
  });
} catch (err) {
  console.log(error("%s (%s) %s"), "AWS", "connection", err);
}

program
  .version(require("./package.json").version)
  .usage("<file> [options]")
  .option("-t, --times [times]", "how many messages should be send")
  .parse(process.argv);

const client = sqsService.getClient();

const messageMap = new Map();
const [configPath] = program.args;
const times = +program.times;

(async () => {
  const requestConfig = parseJSON(await readFile(configPath));
  const messages = [];
  const listener = new Listener(client, messageMap);
  const queueUrl = await sqsService.getQueueUrlPromise(client, {
    QueueName: requestConfig.responseQueue
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

  await sqsService.sendMessage(
    client,
    messages,
    process.env.SQS_PROBE_QUEUE_REQUESTS
  );

  messages.forEach(message =>
    messageMap.set(message.id, { time: process.hrtime(), completed: false })
  );

  console.log(info("------------------------------------------"));
  console.log(info("All messages were added to batch and sent."));
})();
