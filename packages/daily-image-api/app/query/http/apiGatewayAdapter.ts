import { APIGatewayProxyEvent } from "aws-lambda";
import { AppDependencies } from "../AppDependencies";
import { App } from "../app";

const { res } = require("@laconia/event").apigateway;

const domain = "drawbydays.com";
const defaultOrigin = `http://${domain}`;

const withCors = (next: any) => async (event: APIGatewayProxyEvent, ...args: any[]) => {
  const response = await next(event, ...args);

  const origin = event.headers && event.headers.origin;
  const isOriginDrawByDays = origin && origin.endsWith(domain);

  response.headers["Access-Control-Allow-Origin"] = isOriginDrawByDays ? origin : defaultOrigin;

  return response;
};

export const apiGatewayAdapter = (app: App) =>
  withCors(async (event: APIGatewayProxyEvent, dependencies: AppDependencies) => {
    if (!event.pathParameters || !("date" in event.pathParameters)) {
      // TODO Implement error handling https://laconiajs.io/docs/guides/creating-api-endpoints
      return res({ error: { message: "Date is missing from path" } }, 500);
    }

    const date = Date.parse(event.pathParameters["date"]);

    if (Number.isNaN(date)) {
      return res({ error: { message: "Invalid date" } }, 500);
    }

    try {
      const output = await app(new Date(date), dependencies);
      return res(output);
    } catch (err) {
      console.log(err);
      return res({ error: { message: "Unknown error" } }, 500);
    }
  });
