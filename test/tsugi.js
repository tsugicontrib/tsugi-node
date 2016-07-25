var assert = require('chai').assert;

var Config = require('../src/Config');
var Tsugi = require('../src/Tsugi');
Tsugi.unit_testing = true;
var CFG = null;

let sql = '';

function fakePostCore() {
    f = {};
    f.resource_link_id = "667587732";
    f.resource_link_title = "Activity: attend";
    f.resource_link_description = "A weekly blog.";
    f.tool_consumer_info_product_family_code = "ims";
    f.tool_consumer_info_version = "1.1";
    f.tool_consumer_instance_guid = "lmsng.ischool.edu";
    f.tool_consumer_instance_description = "University of Information";
    f.oauth_callback = "about:blank";
    f.launch_presentation_css_url = "http://localhost:8888/tsugi/lms.css";
    f.lti_version = "LTI-1p0";
    f.lti_message_type = "basic-lti-launch-request";
    f.ext_submit = "Finish Launch";
    f.oauth_version = "1.0";
    f.oauth_nonce = "e5c4e475c39eb4d4223a232f99fbd39f";
    f.oauth_timestamp = "1433793103";
    f.oauth_consumer_key = "12345";
    f.oauth_signature_method = "HMAC-SHA1";
    f.oauth_signature = "y21x1iiVNp2UmDNJRp/MYLsgkEM=";
    f.ext_submit = "Finish Launch";
    return f;
}

function fakePost1() {
    f = fakePostCore();
    f.context_id = "456434513";
    f.context_label = "SI106";
    f.context_title = "Introduction to Programming";
    f.user_id = "292832126";
    f.lis_person_name_full = "Jane Instructor";
    f.lis_person_name_family = "Instructor";
    f.lis_person_name_given = "Jane";
    f.lis_person_contact_email_primary = "inst@ischool.edu";
    f.lis_person_sourcedid = "ischool.edu:inst";
    f.lis_result_sourcedid = "e10e575674e68bbcd873e2962f5a138b";
    f.lis_outcome_service_url = "http://localhost:8888/tsugi/common/tool_consumer_outcome.php?b64=MTIzNDU6OjpzZWNyZXQ6Ojo=";
    f.resource_link_title = "Activity: attend";
    f.resource_link_description = "A weekly blog.";
    f.roles = "Instructor";
    return f;
}

function fakePost2() {
    f = fakePostCore();
    f.custom_courseoffering_sourcedid = "456434513";
    f.custom_courseoffering_label = "SI106";
    f.custom_courseoffering_title = "Introduction to Programming";
    f.user_id = "292832126";
    f.custom_person_name_full = "Jane Instructor";
    f.custom_person_name_family = "Instructor";
    f.custom_person_name_given = "Jane";
    f.custom_person_contact_email_primary = "inst@ischool.edu";
    f.custom_person_sourcedid = "ischool.edu:inst";
    f.custom_result_url = "http://localhost:8888/tsugi/common/result.php?id=1234567";
    f.custom_resourcelink_title = "Activity: attend";
    f.custom_resourcelink_description = "A weekly blog.";
    f.custom_result_comment = "Nice work";
    f.custom_result_resultscore = "0.9";
    f.custom_membership_role = "Instructor";
        return f;
}
   
function fakePost1s() {
    f = fakePostCore();
    f.context_id = "456434513";
    f.context_label = "SI106";
    f.context_title = "Introduction to Programming";
    f.user_id = "292832126";
    f.lis_person_name_full = "John Student";
    f.lis_person_contact_email_primary = "john@ischool.edu";
    f.lis_person_sourcedid = "ischool.edu:john";
    f.lis_result_sourcedid = "99999999999999999999999999999999";
    f.lis_outcome_service_url = "http://localhost:8888/tsugi/common/tool_consumer_outcome.php?b64=MTIzNDU6OjpzZWNyZXQ6Ojo=";
    f.roles = "Learner";
    return f;
}


describe("Tsugi", function () {
    it("Should pass the constructor", function() {
        CFG = new Config();
        CFG.unitTesting = true;
    });

    it('Should decript the sql password', function() {
        assert.equal(CFG.dbpass,'ltipassword');
    });

    it('Should extract post data properly',function() {
        let p = fakePost1();
        let q = Tsugi.extractPost(p);
        assert.equal(q.context_key,'456434513');
        assert.equal(q.user_key, '292832126');
        assert.equal(q.sourcedid, 'e10e575674e68bbcd873e2962f5a138b');
        assert.equal(q.context_title, 'Introduction to Programming');

        p = fakePost1s();
        q = Tsugi.extractPost(p);
        assert.equal(q.nonce, 'e5c4e475c39eb4d4223a232f99fbd39f');
        assert.equal(q.link_key, '667587732');
        assert.equal(q.context_key, '456434513');
        assert.equal(q.user_key, '292832126');
        assert.equal(q.sourcedid, '99999999999999999999999999999999');
        assert.equal(q.context_title, 'Introduction to Programming');

        p = fakePost2();
        q = Tsugi.extractPost(p);
        assert.equal(q.link_title, 'Activity: attend');
        assert.equal(q.user_email, 'inst@ischool.edu');
        assert.equal(q.user_displayname, 'Jane Instructor');
        assert.equal(q.role, '1000');
    });

    it('Should load all data correctly', function(done) {
        let p = fakePost2();
        let q = Tsugi.extractPost(p);
        let x = Tsugi.loadAllData(CFG, q);
        console.log("loadAllData returns",x);
        // Tsugi.loadAllData(CFG, q).then( function(rows) {
        x.then( function(rows) {
            console.log("Data Rows: ", rows.length);
            let row = {};
            if ( rows.length > 0 ) {
                row = rows[0];
            }
            Tsugi.adjustData(CFG, row, q);
            console.log("All adjusted");
            console.log(row);
            done();
        }, function(err) {
            console.log("WTF", err);
            done(err);
        });

    });

});

