const { SQS } = require("aws-sdk");
const chalk = require("chalk");
const uuid = require("uuid/v4");

const error = chalk.bold.red;

const WINSTON_SQS_PREFIX = "SQS LOG:";

class SQSService {
  async sendMessage(client, message, responseQueue) {
    try {
      const queueUrl = await this.getQueueUrlPromise(client, {
        QueueName: responseQueue
      });
      if (Array.isArray(message) && message.length > 0) {
        await this.sendMessageBatchPromise(client, queueUrl.QueueUrl, message);
      } else {
        await this.sendMessagePromise(client, queueUrl.QueueUrl, message);
      }
    } catch (err) {
      console.log(error("%s (%s) %s"), WINSTON_SQS_PREFIX, "sendmessage", err);
      throw new Error(err);
    }
  }

  getQueueUrlPromise(client, params) {
    return new Promise((resolve, reject) => {
      client.getQueueUrl(params, (err, data) => {
        if (err) {
          console.log(
            error("%s (%s)"),
            WINSTON_SQS_PREFIX,
            "getQueueUrlPromise",
            err
          );
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  getClient(region) {
    return new SQS({ region });
  }

  sendMessagePromise(client, queueUrl, message) {
    const params = {
      MessageBody: JSON.stringify(message),
      QueueUrl: queueUrl
    };
    return new Promise((resolve, reject) => {
      client.sendMessage(params, (err, data) => {
        if (err) {
          console.log(
            error("%s (%s)"),
            WINSTON_SQS_PREFIX,
            "sendMessagePromise",
            err
          );
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  sendMessageBatchPromise(client, queueUrl, messages) {
    const params = {
      Entries: messages.map(message => {
        return {
          Id: message.id || uuid(),
          MessageBody: JSON.stringify(message)
        };
      }),
      QueueUrl: queueUrl
    };
    return new Promise((resolve, reject) => {
      client.sendMessageBatch(params, (err, data) => {
        if (err) {
          console.log(
            error("%s (%s)"),
            WINSTON_SQS_PREFIX,
            "sendMessageBatchPromise",
            err
          );
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}

module.exports = new SQSService();
