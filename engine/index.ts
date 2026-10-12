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


