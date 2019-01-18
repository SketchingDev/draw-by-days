export const expectMessageProperty = (expectedMessage: string) => {
  return (item: { message: string }) => {
    expect(item.message).toBe(expectedMessage);
  };
};
