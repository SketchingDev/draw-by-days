interface IEnvVarValidatorOptions {
  Names: string[];
}

const createError = (unsetKeys: string[]) => {
  let message = "";

  if (unsetKeys.length === 1) {
    message = `Environment variable ${unsetKeys[0]} has not been set`;
  } else {
    message = "The following environment variables have not been set:\n";
    message += unsetKeys.map(v => ` - ${v}`).join("\n");
  }

  return new Error(message);
};

export const envVarValidator = (config: IEnvVarValidatorOptions) => ({
  before: (handler: any, next: () => void) => {
    const unsetKeys = config.Names.filter(key => !(key in process.env));

    if (unsetKeys.length > 0) {
      throw createError(unsetKeys);
    }

    next();
  },
});
