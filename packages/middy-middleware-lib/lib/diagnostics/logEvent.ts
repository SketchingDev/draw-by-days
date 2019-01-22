export const logEvent = () => ({
  before: (handler: { event: object }, next: () => void) => {
    console.log("Event received", JSON.stringify(handler.event));
    next();
  },
});
