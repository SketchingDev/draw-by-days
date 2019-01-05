import middy from "middy";
import { envVarValidator, logEvent } from "middy-middleware-lib";
import { produceImageAvailableEvent } from "./produceImageAvailableEvent";

const requiredEnvVariables = { Names: ["SNS_TOPIC_ARN"] };

export const handler = middy(produceImageAvailableEvent)
  .use(logEvent())
  .use(envVarValidator(requiredEnvVariables));

module.exports = { handler };
