import { ScheduledHandler } from "aws-lambda";
import { errorHandler } from "../../src/errorHandler";

describe("Error Handler", () => {

  it("Re-throws errors", async () => {
    const error = new Error("Test error message");
    const handlerThatErrors = () => { throw error; };

    const handler = errorHandler(handlerThatErrors, { error: jest.fn() });

    await expect(handler({} as any, {} as any, () => undefined))
      .rejects.toThrow(error);
  });

  it("Logs errors from handler", async () => {
    const error = new Error("Test error message");
    const handlerThatErrors = () => { throw error; };

    const logger = { error: jest.fn() };
    const handler: ScheduledHandler = errorHandler(handlerThatErrors, logger);

    await expect(handler({} as any, {} as any, () => undefined))
      .rejects.toThrow();

    expect(logger.error).toHaveBeenCalledWith("An error occurred", { error });
  });
});
