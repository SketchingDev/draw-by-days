import { snsSchema } from "aws-types-lib";
import middy from "middy";
import { envVarValidator, logEvent } from "middy-middleware-lib";
import { validator } from "middy/middlewares";
import { saveImageDetails } from "./saveImageDetails";
import { extractFirstSnsRecord } from "./sns/extractFirstSnsRecord";
import { extractParsedJsonSnsMessage } from "./sns/extractParsedJsonSnsMessage";

const requiredEnvVariables = { Names: ["TABLE_NAME"] };

export const handler = middy(saveImageDetails)
  .use(logEvent())
  .use(validator({ inputSchema: snsSchema }))
  .use(envVarValidator(requiredEnvVariables))
  .use(extractFirstSnsRecord())
  .use(extractParsedJsonSnsMessage());

module.exports = { handler };
