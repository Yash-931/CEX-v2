import { createClient } from "redis";

export const queueId = Math.random();
const subscriberClient = await createClient({})
  .on("error", (err) =>
    console.error("Error occured while connecting to redis: " + err),
  )
  .connect();

//TODO => add type here
let pendingResolves: any = {};

async function pollQueue() {
  const response = await subscriberClient.brPop("response-queue-" + queueId, 1);

  if (!response) {
    pollQueue();
  } else {
    const parsedResponse = JSON.parse(response!.element);

    if (
      parsedResponse.identifier &&
      pendingResolves[parsedResponse.identifier]
    ) {
      pendingResolves[parsedResponse.identifier]({
        filledQty: parsedResponse.filledQty,
      });
    }
    pollQueue();
  }
}

pollQueue()

export async function untilWeGotBack(identifier: number) {
  return new Promise((resolve, reject) => {
    pendingResolves[identifier] = resolve;
  });
}
