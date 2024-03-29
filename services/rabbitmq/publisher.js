import closeOnError from './closeOnError.js';

let publisherChannel;
const offlineQueue = [];
const startPublisher = async connection => {
  try {
    publisherChannel = await connection.createConfirmChannel();
    publisherChannel.on('error', error => console.error('[AMQP] Channel error:\n', error.message));
    publisherChannel.on('close', () => {});

    while (offlineQueue.length) {
      const job = offlineQueue.shift();
      if (!job) break;
      const [exchange, routingKey, data] = job;
      publishToQueue(exchange, routingKey, data);
    }
  } catch (error) {
    if (closeOnError(connection, error)) return;
  }
};

const publishToQueue = async (exchange, routingKey, data) => {
  const message = Buffer.from(JSON.stringify(data));
  try {
    await publisherChannel.publish(exchange, routingKey, message, { persistent: true });
  } catch (error) {
    offlineQueue.push([exchange, routingKey, message]);
    if (publisherChannel) publisherChannel.connection.close();
  }
};

export { startPublisher, publishToQueue };
