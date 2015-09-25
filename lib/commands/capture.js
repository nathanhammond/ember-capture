/* jshint node: true */
'use strict';

var assign      = require('lodash/object/assign');
var path        = require('path');
var Command     = require('ember-cli/lib/models/command');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('silent-error');
var PortFinder  = require('portfinder');
var win         = require('ember-cli/lib/utilities/windows-admin');
var EOL         = require('os').EOL;
var CaptureTask = require('../tasks/capture');

PortFinder.basePort = 49152;

var getPort = Promise.denodeify(PortFinder.getPort);
var defaultPort = process.env.PORT || 4200;

module.exports = Command.extend({
  name: 'capture',
  description: 'Captures all states of your application.',

  availableOptions: [
    { name: 'port',             type: Number,  default: defaultPort,   aliases: ['p'] },
    { name: 'host',             type: String,                          aliases: ['H'],     description: 'Listens on all interfaces by default' },
    { name: 'proxy',            type: String,                          aliases: ['pr', 'pxy'] },
    { name: 'insecure-proxy',   type: Boolean, default: false,         aliases: ['inspr'], description: 'Set false to proxy self-signed SSL certificates' },
    { name: 'environment',      type: String,  default: 'development', aliases: ['e', { 'dev': 'development' }, { 'prod': 'production' }] },
    { name: 'output-path',      type: path,    default: 'dist/',       aliases: ['op', 'out'] },
    { name: 'ssl',              type: Boolean, default: false },
    { name: 'ssl-key',          type: String,  default: 'ssl/server.key' },
    { name: 'ssl-cert',         type: String,  default: 'ssl/server.crt' }
  ],

  run: function(commandOptions) {
    var port = commandOptions.port ? Promise.resolve(commandOptions.port) : getPort({ host: commandOptions.host });

    return port.then(function(port) {
      commandOptions = assign({}, commandOptions, {
        port: port,
        baseURL: this.project.config(commandOptions.environment).baseURL || '/'
      });

      if (commandOptions.proxy) {
        if (!commandOptions.proxy.match(/^(http:|https:)/)) {
          var message = 'You need to include a protocol with the proxy URL.' + EOL + 'Try --proxy http://' + commandOptions.proxy;

          return Promise.reject(new SilentError(message));
        }
      }

      var capture = new CaptureTask({
        ui: this.ui,
        analytics: this.analytics,
        project: this.project
      });

      return win.checkWindowsElevation(this.ui).then(function() {
        return capture.run(commandOptions);
      });
    }.bind(this));
  }
});
