'use strict';

module.exports = {
  normalizeEntityName: function() {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  },

  afterInstall: function() {
    // return this.addPackagesToProject([
    //   { name: 'screenshot-server', target: '0.0.x' }
    // ]).then(function() {
    //   return this.addBowerPackagesToProject([
    //     { name: 'screenshot-client', target: '0.0.x' }
    //   ]);
    // }.bind(this));
  }
};
