import { ScheduledHandler } from "aws-lambda";
import { ErrorDownloadingFile } from "./app";

export const errorHandler = (handler: ScheduledHandler, logger: Pick<Console, "error"> = console): ScheduledHandler => async (event, context, callback) => {
  try {
    return await handler(event, context, callback);
  } catch (error) {
    if (error instanceof ErrorDownloadingFile) {
      logger.error("Error downloading file to tweet", {
        originalError: error.message,
        source: error.source,
        destination: error.destination
      });
    }
    throw error;
  }
};
