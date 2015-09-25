/* jshint node: true */
'use strict';

var path = require('path');

module.exports = {
  name: 'ember-capture',

  includedCommands: function() {
    return {
      capture: require('./lib/commands/capture')
    }
  },

  included: function (app, parentAddon) {
    var target = (parentAddon || app);
    this._super.included(target);

    if (app.tests) {
      app.import(path.join('vendor', 'ember-capture', 'capture-client.js'), {
        type: 'test',
        prepend: true
      });
    }
  },

  contentFor: function(type, config, content) {
    if (this.contentForMethods[type]) {
      return this.contentForMethods[type](config, content);
    }
  },

  contentForMethods: {
    "test-body": function(config, content) {
      for (var i = 0; i < content.length; i++) {
        if (~content[i].toString().indexOf('ember-testing-container')) {
          content = content.splice(i,1);
        }
      }
    }
  }
};
