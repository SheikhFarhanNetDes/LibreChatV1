const { FileSources } = require('librechat-data-provider');
const { initializeFirebase } = require('./Files/Firebase/initialize');
const loadCustomConfig = require('./Config/loadCustomConfig');
const handleRateLimits = require('./Config/handleRateLimits');
const { loadAndFormatTools } = require('./ToolService');
const paths = require('~/config/paths');

/**
 *
 * Loads custom config and initializes app-wide variables.
 * @function AppService
 * @param {Express.Application} app - The Express application object.
 */
const AppService = async (app) => {
  /** @type {TCustomConfig}*/
  const config = (await loadCustomConfig()) ?? {};
  handleRateLimits(config?.rateLimits);

  const socialLogins = config?.registration?.socialLogins ?? [
    'google',
    'facebook',
    'openid',
    'github',
    'discord',
  ];
  const fileStrategy = config.fileStrategy ?? FileSources.local;
  process.env.CDN_PROVIDER = fileStrategy;

  if (fileStrategy === FileSources.firebase) {
    initializeFirebase();
  }

  /** @type {Record<string, FunctionTool} */
  const availableTools = loadAndFormatTools({
    directory: paths.structuredTools,
    filter: new Set([
      'ChatTool.js',
      'CodeSherpa.js',
      'CodeSherpaTools.js',
      'E2BTools.js',
      'extractionChain.js',
    ]),
  });

  app.locals = {
    socialLogins,
    availableTools,
    fileStrategy,
    paths,
  };
};

module.exports = AppService;
