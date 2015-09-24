'use strict';

module.exports = function(environment) {
  var results = {
    APP: {
      options: {
        'ember-cli-qunit': {
          disableContainerStyles: true
        }
      },
      rootElement: 'body'
    }
  };

  if (environment === 'test') {
    return results;
  } else {
    return {};
  }
};
