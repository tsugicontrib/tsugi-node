var assert = require('chai').assert;

var expect = require('chai').expect;

var Config = require('../src/Config');
var CFG = null;

let sql = '';

describe("PDOX", function () {
    it("Should pass the constructor", function() {
        CFG = new Config();
        CFG.unitTesting = true;
    });

    it('Should descript the sql password', function() {
        assert.equal(CFG.dbpass,'ltipassword');
    });

    if('Should handle bad SQL', function() {
        var sql = 'XDROP TABLE IF EXISTS {p}lti_unit_test';
        assert.throw(CFG.pdox.query(sql));
    });
    it('Should drop a table', function() {
        var sql = 'DROP TABLE IF EXISTS {p}lti_unit_test';
        var result = CFG.pdox.query(sql).then( function(retval) {
            assert.equal(retval,0);
            done();
        });
    });

    it('Should create a table', function() {
        sql = 'CREATE TABLE {p}lti_unit_test (id int NOT NULL AUTO_INCREMENT, name varchar(255), email varchar(255), PRIMARY KEY(id))';
        CFG.pdox.query(sql).then( function(retval) {
            // console.log("CREATE retval:",retval);
            assert.equal(retval,0);
            done();
        });
    });

    it('Should insert a row', function() {
        sql = "INSERT INTO {p}lti_unit_test (name,email) VALUES ('tsugi', 'tsugi@zap.com')";
        CFG.pdox.insertKey(sql).then( function(retval) {
            // console.log("INSERT retval:",retval);
            assert.equal(retval, 1);
            done();
        });
    });

    it('Should update a row', function() {
        sql = "UPDATE {p}lti_unit_test SET email=:new WHERE name='tsugi'";
        CFG.pdox.queryChanged(sql,{new:'tsugi@fred.com'}).then( function(retval) {
            // console.log("UPDATE retval:",retval);
            assert.equal(retval, 1);
            done();
        });
    });

    it('Should select a row', function() {
        sql = "SELECT * FROM {p}lti_unit_test";
        CFG.pdox.allRowsDie(sql).then( function(retval) {
            assert.isNotNull(retval);
            assert.isArray(retval);
            assert.equal(retval.length,1);
            assert.equal(retval[0].id,1);
            assert.equal(retval[0].name,'tsugi');
            assert.equal(retval[0].email,'tsugi@zap.com');
            // console.log("SELECT retval:",retval);
            done();
        });
    });

    it('Should delete a row', function() {
        sql = "DELETE FROM {p}lti_unit_test WHERE name='tsugi'";
        CFG.pdox.query(sql).then( function(retval) {
            // console.log("DELETE retval:",retval);
            assert.equal(retval,1);
        });
    });

});
