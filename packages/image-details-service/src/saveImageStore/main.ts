import { Context } from "aws-lambda";
import { ResultCallback } from "aws-types-lib";
import middy from "middy";

export const saveImageStoreHandler = (event: any, context: Context, callback: ResultCallback) =>
  callback(null, { result: "success", message: "" });

module.exports = { handler: middy(saveImageStoreHandler) };
