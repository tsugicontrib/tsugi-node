

var TsugiUtils = require('../src/TsugiUtils');

describe('TsugiUtils', function() {
  it('emptyPromise', function () {
    TsugiUtils.emptyPromise(42).then( function(val) {
        assert.equal(val, 42);
        console.log("Empty 42 success (correct):", val);
    }, function(val) {
        assert.fail("Empty 42 fail:"+val);
    });
  });


  it("emptyPromiseFail", function() {
    TsugiUtils.emptyPromiseFail(43).then( function(val) {
        assert.fail("Empty 43 success:"+val);
    }, function(val) {
        assert.success("Empty 43 fail (correct):"+val);
    });
  });

  it("FailInSeries", function() {
    TsugiUtils.emptyPromise(44).then( function(val) {
        return 20;
    }, function(val) {
        assert.fail("Then 1 fail (bad):"+val);
    }).then( function(val) {
        assert.success("Then 2 starting"+val);
        TsugiUtils.emptyPromiseFail(val).then( function(val) {
            assert.fail("Then 2 success (bad):"+val);
            return 22;
        // Note that if you *catch* the error, it does not break the then chain
        // }, function(val) {
            // console.log("Then 2 fail (good):", val);
            // return 23;
        }).then( function(val) {
            assert.fail("Then 3 starting (bad)"+val);
        });
    });
  });

// Returning a promise from within a promise
  it("PromiseWithinPromise", function() {
    TsugiUtils.emptyPromise(52).then( function(val) {
        assert.equal(val,52);
        return TsugiUtils.emptyPromise(53);
    }).then( function(val) {
        assert.equal(val,53);
    });
  });

});
