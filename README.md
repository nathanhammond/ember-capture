# ember-capture

Automated state capture for Ember applications.

`ember install ember-capture`

[Patch for ember-cli-qunit](https://github.com/ember-cli/ember-cli-qunit/pull/80):
```
diff --git a/config/environment.js b/config/environment.js
new file mode 100644
index 0000000..e525acc
--- /dev/null
+++ b/config/environment.js
@@ -0,0 +1,17 @@
+'use strict';
+
+module.exports = function(environment) {
+  var results = {
+    APP: {
+      LOG_ACTIVE_GENERATION: false,
+      LOG_VIEW_LOOKUPS: false,
+      rootElement: '#ember-testing'
+    }
+  };
+
+  if (environment === 'test') {
+    return results;
+  } else {
+    return {};
+  }
+};
```

[Patch for ember-cli](https://github.com/ember-cli/ember-cli/pull/4890):
```
diff --git a/lib/broccoli/ember-app.js b/lib/broccoli/ember-app.js
index 8efeddc..5e0e9af 100644
--- a/lib/broccoli/ember-app.js
+++ b/lib/broccoli/ember-app.js
@@ -1438,7 +1438,7 @@ EmberApp.prototype.contentFor = function(config, match, type) {
   }
 
   content = this.project.addons.reduce(function(content, addon) {
-    var addonContent = addon.contentFor ? addon.contentFor(type, config) : null;
+    var addonContent = addon.contentFor ? addon.contentFor(type, config, content) : null;
     if (addonContent) {
       return content.concat(addonContent);
     }
```

[Not-required patch for ember-cli.](https://github.com/ember-cli/ember-cli/pull/4894)

## Installation

* `ember install ember-capture`

## Developing

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
