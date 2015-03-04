'use strict';

var Promise = require('bluebird/js/main/promise')(); // use this syntax to be able to modify bluebird without affecting other users

/**
 * A slightly modified version of bluebird promises. This means that, on top of the methods below, you can also call all the methods listed on the link below.
 *
 * The main difference is that sequelize promises allows attaching a CLS namesapce
 *
 * The sequelize promise class works seamlessly with other A+/thenable libraries,
 *
 * @mixes https://github.com/petkaantonov/bluebird/blob/master/API.md
 * @class Promise
 */
var SequelizePromise = function (resolver) {
  var self = this;

  var promise = new Promise(function sequelizeResolver(resolve, reject) {
    self.seqResolve = resolve;
    self.seqReject = reject;

    return resolver(resolve, reject);
  });

  promise.seqResolve = this.seqResolve;
  promise.seqReject = this.seqReject;

  return promise;
};

var util = require('util');
util.inherits(SequelizePromise, Promise);

for (var method in Promise) {
  if (Promise.hasOwnProperty(method)) {
    SequelizePromise[method] = Promise[method];
  }
}

var bluebirdThen = Promise.prototype._then;
Promise.prototype._then = function (didFulfill, didReject, didProgress, receiver, internalData) {
  if (SequelizePromise.Sequelize.cls) {
    var ns = SequelizePromise.Sequelize.cls;
    if (typeof didFulfill === 'function') didFulfill = ns.bind(didFulfill);
    if (typeof didReject === 'function') didReject = ns.bind(didReject);
    if (typeof didProgress === 'function') didProgress = ns.bind(didProgress);
  }

  return bluebirdThen.call(this, didFulfill, didReject, didProgress, receiver, internalData);
};

module.exports = SequelizePromise;
