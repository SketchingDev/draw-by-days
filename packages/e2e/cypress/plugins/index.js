// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const exposeAwsCredentials = config => {
  config.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  config.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

  return config;
};

module.exports = (on, config) => {
  return exposeAwsCredentials(config);
};
