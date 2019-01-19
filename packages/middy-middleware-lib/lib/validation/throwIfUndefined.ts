// TODO This doesn't belong in this package

export const throwIfUndefined = <T>(value: T | undefined, message: string) => {
  if (value === undefined) {
    throw new Error(message);
  }

  return value;
};
