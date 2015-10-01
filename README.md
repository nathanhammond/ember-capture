# ember-capture

Automated state capture for Ember applications.

## Installation

* `npm install --save-dev ember-cli/ember-cli#fba306822da476f4debd2173e83fd925a286727b`
* `npm install --save-dev ember-cli/ember-cli-qunit#f12f677a00a7de638a47a401aa74562b17257bcd`
* `ember install ember-capture`
* Remove `ENV.APP.rootElement = '#ember-testing';` from `config/environment.js`.

If it's a new app, ember-capture piggybacks on your Acceptance tests. `ember g acceptance-test index` and go modify the test to `visit('/');`.

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
