export const logEvent = () => ({
  before: (handler: { event: object }, next: () => void) => {
    console.log("Event received", JSON.stringify(handler.event));
    next();
  },
  onError: (handler: { error: object }, next: () => void) => {
    console.log("Error", handler.error);
    next();
  },
});
