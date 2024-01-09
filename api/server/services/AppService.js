const { FileSources } = require('librechat-data-provider');
const { initializeFirebase } = require('./Files/Firebase/initialize');
const loadCustomConfig = require('./Config/loadCustomConfig');
const paths = require('~/config/paths');

/**
 *
 * Loads custom config and initializes app-wide variables.
 * @function AppService
 * @param {Express.Application} app - The Express application object.
 */
const AppService = async (app) => {
  const config = (await loadCustomConfig()) ?? {};
  const fileStrategy = config.CDN_PROVIDER ?? FileSources.local;

  if (fileStrategy === FileSources.firebase) {
    initializeFirebase();
  }

  app.locals = {
    fileStrategy,
    paths,
  };
};

module.exports = AppService;
