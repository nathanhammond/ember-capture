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
  },

  serverMiddleware: function(config) {
    var app = config.app;
    var options = config.options;
    var project = options.project;

    // TODO: Switch on and off based upon the environment.

    app.use(function(req, res, next) {
      var appConfig = project.config(options.environment);

      // If we're not using CSP headers, bail.
      if (!appConfig || !appConfig.contentSecurityPolicyHeader || !appConfig.contentSecurityPolicy) {
        next();
        return;
      }

      var header = appConfig.contentSecurityPolicyHeader;
      var headerConfig = appConfig.contentSecurityPolicy;
      var normalizedHost = (options.captureHost ? options.captureHost : 'localhost');
      var captureServerURL = 'http://' + normalizedHost + ':' + options.capturePort + '/';

      // Make sure it exists.
      headerConfig['connect-src'] = headerConfig['connect-src'] || '';

      // Add ourselves to the list.
      headerConfig['connect-src'] = headerConfig['connect-src'] + ' ' + captureServerURL;

      // Collapse all of the values back into the header.
      var headerValue = Object.keys(headerConfig).reduce(function(memo, value) {
        return memo + value + ' ' + headerConfig[value] + '; ';
      }, '');

      res.removeHeader("Content-Security-Policy");
      res.removeHeader("X-Content-Security-Policy");

      res.removeHeader('Content-Security-Policy-Report-Only');
      res.removeHeader('X-Content-Security-Policy-Report-Only');

      res.setHeader(header, headerValue);
      res.setHeader('X-' + header, headerValue);

      next();
    });
  }
};
