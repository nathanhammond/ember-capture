'use strict';

module.exports = function(environment, ENV) {
  // Make the tree exist.
  ENV.APP = ENV.APP || {};
  ENV.APP.options = ENV.APP.options || {};
  ENV.APP.options['ember-cli-qunit'] = ENV.APP.options['ember-cli-qunit'] || {};
  ENV.APP.options['ember-capture'] = ENV.APP.options['ember-capture'] || {};

  // FIXME: We should be more clever about how we assign rootElement.
  if (environment === 'capture' || environment === 'test') {
    ENV.APP.options['ember-cli-qunit'].disableContainerStyles = true;
    ENV.APP.rootElement = ENV.APP.options['ember-capture'].rootElement || ENV.APP.rootElement;
  }

  return ENV;
};
