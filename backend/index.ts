import type { RedisClientType } from "@redis/client";
import express from "express";
import { createClient } from "redis";

const app = express();

app.use(express.json());

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

app.post("/order", async (req, res) => {
  const userId = req.userId;
  const { price, qty, name, side, orderType } = req.body;

  //the order goes to the engine backend via a queue
  await publisherClient.lPush(
    "order-queue",
    JSON.stringify({
      price: price,
      qty: qty,
      name: name,
      side: side,
      orderType: orderType,
      userId: userId,
    }),
  );
});

app.listen(3000);
