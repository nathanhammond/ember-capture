function CaptureClient(config) {
  if (config) {
    this.config = config;
  } else {
    config = {
      serverURL: undefined,
      clientID: undefined
    };

    var regex, camelCase;
    for (var x in config) {
      camelCase = x.replace(/^./, function(match) { return match.toUpperCase(); });
      regex = new RegExp("capture"+camelCase+"=([^&]*)");
      if (regex.test(window.location.search)) {
        config[x] = decodeURIComponent(regex.exec(window.location.search)[1]);
      }
    }

    this.config = config;
  }
};

CaptureClient.prototype.capture = function(endpoint, metadata) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", this.config.serverURL + endpoint, false);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send("captureClientID=" + this.config.clientID);
}

CaptureClient.prototype.captureScreenshot = function(metadata) {
  return this.capture('screenshot', metadata);
}

var myCaptureClient = new CaptureClient();

// TODO: Don't capture during application teardown.
// TODO: Notify capture-server when all tests are complete.
Ember.run.backburner.options.render = {
  after: function() { myCaptureClient.captureScreenshot(); }
};
