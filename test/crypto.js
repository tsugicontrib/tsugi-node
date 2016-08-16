var assert = require('chai').assert;

var Crypto = require('../src/util/Crypto');

let bob = Crypto.sha256('bob');

describe('Crypto', function() {
  describe('#sha256', function () {
    it('Basic functionality', function () {
      assert.equal(bob, '81b637d8fcd2c6da6359e6963113a1170de795e4b725b84d1e0b4cfd9ec58ce9');
    });
  });
});
