/* jshint node: true */
'use strict';

var fs           = require('fs');
var http         = require('http');
var path         = require('path');
var stream       = require('stream');
var querystring  = require('querystring');
var Promise      = require('ember-cli/lib/ext/promise');
var Task         = require('ember-cli/lib/models/task');
var express      = require('express');
var bodyParser   = require('body-parser');
var SilentError  = require('silent-error');
var webdriver    = require('selenium-webdriver');
var mkdirp       = require('mkdirp');
var cleanBaseURL = require('clean-base-url');
var execFile     = require('child_process').execFile;
var optipng      = require('optipng-bin');

function o_keys(dict) {
  return Object.keys.call(Object, dict);
}

function getDrivers(options) {
  // TODO: Make this work with Selenium Grid.

  // Set up the drivers dictionary.
  var drivers = Object.create(null);
  drivers.firefox = undefined;
  // drivers.safari = undefined;
  // drivers.chrome = undefined;
  // drivers.opera = undefined;

  // Set up all of the drivers.
  o_keys(drivers).forEach(function(browser) {
    var driver = new webdriver.Builder().forBrowser(browser);

    // Fix up Chrome's arguments.
    if (browser === 'chrome') {
      driver.withCapabilities({ browserName: 'chrome', 'chromeOptions': { args: ['test-type', 'start-maximized'] } });
    }

    drivers[browser] = driver.build();
    drivers[browser].manage().window().setPosition(0, 0)
    drivers[browser].manage().window().maximize();
  });

  return drivers;
}

function createServer(drivers, options) {
  var app = express();
  var previousScreenshot = Object.create(null);
  var counter = 0;

  // Enable CORS.
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });

  // For parsing application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));

  // Information about the capture server.
  app.get('/', function(req, res) {
    res.send('Capture server ready. Drivers prepared: ' + o_keys(drivers).join(', ') + '.');
  });

  app.post('/screenshot', function(req, res) {
    var browser = req.body.captureClientID;
    var driver = drivers[browser];

    // TODO: Force full-height screenshots outside of Firefox.
    // TODO: Take screenshots at multiple sizes.
    // TODO: Enable size configuration: driver.manage().window().setSize(1280, , 10));
    // TODO: Store metadata.

    driver
      .takeScreenshot()
      .then(function(base64) {
        // Prevent duplicate screenshots.
        if (base64 === previousScreenshot[browser]) {
          return Promise.reject('Duplicate.')
        }

        previousScreenshot[browser] = base64;
        return base64;
      })
      .then(function(base64) {
        // Write to disk.
        var filepath = path.join('.', options.captureOutputPath, browser);
        var filename = (+new Date()) + '.png';
        var fullpath = path.join(filepath, filename);
        mkdirp.sync(filepath);

        if (fs.existsSync(fullpath)) {
          fullpath.replace('.png', '-' + (counter++) + '.png')
        }

        return new Promise(function(resolve, reject) {
          fs.writeFile(fullpath, base64, {encoding: 'base64'}, function(error) {
            error ? reject(error) : resolve(fullpath);
          });
        });
      })
      .then(function(fullpath) {
        // Optimize the PNG.
        return true;

        // FIXME: Too slow to use.
        return new Promise(function(resolve, reject) {
          execFile(optipng, [fullpath], function(error) {
            error ? reject(error) : resolve(fullpath);
          });
        });
      })
      .then(
        // Respond to client.
        function() {
          return res.sendStatus(204);
        },
        function() {
          return res.sendStatus(500);
        }
      );
  });

  app.post('/done', function(req, res) {
    res.sendStatus(204);

    var browser = req.body.captureClientID;
    var driver = drivers[browser];

    // Close this driver, remove it from the lookup.
    driver.quit().thenFinally(function() {
      delete drivers[browser];

      // If we're all out of drivers, we're done capturing.
      var driverCount = o_keys(drivers).length;
      if (driverCount === 0) {
        app.emit('done');
      }
    });
  });

  return app;
}

module.exports = Task.extend({
  captureServer: function(options) {
    if (this._captureServer) {
      return this._captureServer;
    }

    this._drivers = getDrivers(options);
    this._captureServer = createServer(this._drivers, options);

    var captureServerURL = 'http://' + this.displayHost(options.captureHost) + ':' + options.capturePort + '/';
    var serverURL = 'http' + (options.ssl ? 's' : '') + '://' + this.displayHost(options.host) + ':' + options.port + cleanBaseURL(options.baseURL) + options.testPage;

    // FIXME: Make this a real event.
    this.expressServer.on('listening', function() {
      o_keys(this._drivers).forEach(function(browser) {
        var driver = this._drivers[browser];

        driver.get(serverURL + '?' + querystring.stringify({
          nojshint: true,
          filter: options.filter,
          captureServerURL: captureServerURL,
          captureClientID: browser
        }));
      }.bind(this));
    }.bind(this));

    return this._captureServer;
  },

  listen: function(options) {
    var server = this.captureServer(options);

    return new Promise(function(resolve, reject) {
      server.listen(options.capturePort, function() {
        resolve(server);
      });
      server.on('error', reject);
    });
  },

  start: function(options) {
    var url = 'http://' + this.displayHost(options.captureHost) + ':' + options.capturePort + '/';

    return this.listen(options)
      .then(function(server) {
        this.writeBanner(url);
        return server;
      }.bind(this))
      .catch(this.writeErrorBanner.bind(this, url));
  },

  displayHost: function(specifiedHost) {
    return specifiedHost || 'localhost';
  },

  writeBanner: function(url) {
    this.ui.writeLine('Capture server on ' + url);
  },

  writeErrorBanner: function(url) {
    throw new SilentError('Capture server failed on ' + url + '.  It is either in use or you do not have permission.');
  }
});
