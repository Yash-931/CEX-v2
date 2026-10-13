import type { RedisClientType } from "@redis/client";
import express from "express";
import { createClient } from "redis";
import { untilWeGotBack } from "./untilWeGotBackFn";

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
  const identifier = Math.random()
  const { price, qty, name, side, orderType, userId } = req.body;

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
      identifier: identifier
    }),
  );

  const response = await untilWeGotBack(identifier)

  res.status(201).json({
    message: "Order created success",
    filledQty: response.filledQty
  })
});

app.listen(3000);
