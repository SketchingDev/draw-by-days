import middy from "middy";
import { envVarValidator, logEvent } from "middy-middleware-lib";
import { validator } from "middy/middlewares";
import { saveImageDetailsHandler } from "./saveImageDetailsHandler";
import { extractFirstSnsRecord } from "./sns/extractFirstSnsRecord";
import { extractParsedJsonSnsMessage } from "./sns/extractParsedJsonSnsMessage";
import { snsSchema } from "./sns/snsSchema";

const requiredEnvVariables = { Names: ["TABLE_NAME"] };

export const handler = middy(saveImageDetailsHandler)
  .use(logEvent())
  .use(validator({ inputSchema: snsSchema }))
  .use(envVarValidator(requiredEnvVariables))
  .use(extractFirstSnsRecord())
  .use(extractParsedJsonSnsMessage());

module.exports = { handler };
