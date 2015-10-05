'use strict';

module.exports = function(environment, config) {

  // Check to see if the user passed in settings.
  var captureRootElement;
  if (config && config.APP && config.APP.options && config.APP.options['ember-capture']) {
    captureRootElement = config.APP.options['ember-capture'].rootElement;
  }

  // Use the setting, or the default, 'body'.
  captureRootElement = captureRootElement || 'body';

  var qunitRootElement;
  if (config && config.APP && config.APP.options && config.APP.options['ember-cli-qunit']) {
    qunitRootElement = config.APP.options['ember-cli-qunit'].rootElement;
  }

  var appRootElement;
  if (config && config.APP) {
    appRootElement = config.APP.rootElement;
  }

  if (environment === 'capture') {
    return { APP: { rootElement: appRootElement || captureRootElement } };
  }

  // Because the tests are always built in the test environment we have to get clever.
  // We're after ember-cli-qunit in the DAG, so we have to override anything that it set.
  if (environment === 'test' && qunitRootElement === appRootElement || qunitRootElement === undefined) {
    return { APP: { rootElement: captureRootElement } };
  }

  return {};
};
