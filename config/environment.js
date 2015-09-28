'use strict';

module.exports = function(environment) {
  var ENV = {
    APP: {
      options: {
        'ember-cli-qunit': {
          disableContainerStyles: true
        }
      },
      rootElement: 'body'
    }
  };

  // FIXME: We should be more clever about how we assign rootElement.
  if (environment === 'capture' || environment === 'test') {
    return ENV;
  } else {
    return {};
  }
};
