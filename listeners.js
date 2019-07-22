const { Consumer } = require("sqs-consumer");
const chalk = require("chalk");

const info = chalk.cyan;
const warn = chalk.yellow;
const error = chalk.bold.red;

const { parseJSON, hrtimeToString, hrtimeAdd } = require("./helpers");

class Listener {
  constructor(client, messageMap) {
    this.client = client;
    this.messageMap = messageMap;
  }

  setQueueUrl(queueUrl) {
    this.queueUrl = queueUrl;
    return this;
  }

  sqsListener() {
    const listener = Consumer.create({
      queueUrl: this.queueUrl.QueueUrl,
      handleMessageBatch: messages => {
        console.log(
          info(
            "Received " +
              chalk.bold.green(messages.length) +
              ` message${messages.length > 1 ? "s" : ""}`
          )
        );
        for (const message of messages) {
          const data = message.Body && parseJSON(message.Body);
          const id = data.id;
          if (!this.messageMap.get(id)) {
            console.log(warn(`Unidentified message with id: ${id}`));
            continue;
          }
          const time = process.hrtime(this.messageMap.get(id).time);
          this.messageMap.set(id, { time, completed: true });

          console.log(
            info(
              "Message with id " +
                chalk.bold.green(id) +
                " was processed in " +
                chalk.bold.green(hrtimeToString(time))
            )
          );

          const messageValues = Array.from(this.messageMap.values());

          if (messageValues.every(item => item.completed)) {
            const totalTime = messageValues.reduce(
              (accumulator, currentValue) => {
                return { time: hrtimeAdd(accumulator.time, currentValue.time) };
              }
            ).time;
            console.log(
              info("Total time: " + chalk.bold.green(hrtimeToString(totalTime)))
            );
            process.exit();
          }
        }
      },
      sqs: this.client,
      batchSize: 10
    });

    listener.on("error", err => {
      console.log(error("%s (%s) %s"), "SQS", "listener_error", err);
    });

    listener.on("processing_error", err => {
      console.log(error("%s (%s) %s"), "SQS", "listener_processing_error", err);
    });
    return listener;
  }
}

module.exports = Listener;
