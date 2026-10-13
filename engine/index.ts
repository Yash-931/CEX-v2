import { createClient, type RedisClientType } from "redis";

const subscriberClient: RedisClientType = createClient({});
await subscriberClient
  .on("Error", (err) =>
    console.log("Error connecting the subscriber client ", err),
  )
  .connect();

const publisherClient: RedisClientType = createClient({});
await publisherClient
  .on("Error", (err) =>
    console.log("Error connecting the publisher client ", err),
  )
  .connect();

while (1) {
  const response = await subscriberClient.brPop("order-queue", 1);
  if (!response) {
    continue;
  }
  const parsedResponse = JSON.parse(response.element);

  console.log(parsedResponse);

  if (parsedResponse.orderType === "create_order") {
    //order matching logic
  }

  const filledQty = parsedResponse.qty - 1;
  const identifier = parsedResponse.identifier;

  console.log("publishing to: response-queue-" + parsedResponse.queueId)
  publisherClient.lPush(
    "response-queue-" + parsedResponse.queueId,
    JSON.stringify({ filledQty, identifier }),
  );
}
