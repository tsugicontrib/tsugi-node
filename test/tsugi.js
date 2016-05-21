var assert = require('chai').assert;

var Config = require('../src/Config');
var Tsugi = require('../src/Tsugi');
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

    it('Should descript the sql password', function() {
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

    it('Should load all data correctly', function() {
        let p = fakePost2();
        let q = Tsugi.extractPost(p);
        let x = Tsugi.loadAllData(CFG, q);
        console.log("loadAllData returns",x);
        // Tsugi.loadAllData(CFG, q).then( function(rows) {
        x.then( function(rows) {
            // This never happens in mocha for some reason
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
        });

    });

});

/*

public class TsugiTest {

    public static boolean setupDone = false;
    public static final String unitTestKey = "unit-test-xyzzy-key";
    public static final String unitTestKeySha256 = TsugiUtils.sha256(unitTestKey);
    static Tsugi tsugi = null;
    static Connection c = null;
    static DatabaseMetaData meta = null;
    static boolean localhost = false;
    static Long key_id = null;;
    static Launch launch = null;

    @BeforeClass
    public static void setup() throws Exception {
        tsugi = TsugiFactory.getTsugi();
        if ( tsugi == null ) return;
        c = tsugi.getConnection();
        if ( c == null ) return;
        Properties post = fakePost1();
        // Clean up old data from previous launches
        String query = "DELETE FROM lti_context WHERE context_key = ?;";
        PreparedStatement stmt = c.prepareStatement(query);
        stmt.setString(1, post.getProperty("context_id"));
        stmt.executeUpdate();
        
        launch = tsugi.getLaunch(post);
        meta = c.getMetaData();
        String URL = meta.getURL();
        localhost = URL.indexOf("//localhost") > 0 || URL.startsWith("jdbc:h2:");
    }

    @Test
    public void testMetaData() throws Exception {
        // We will blow up one test if the database is not connected
        if ( c == null || meta == null ) {
            assertTrue(false);
            return;
        }

        String productName = meta.getDatabaseProductName();
        String productVersion = meta.getDatabaseProductVersion();
        String URL = meta.getURL();
        System.out.println("Connection product=" + productName+" version=" + productVersion);
        System.out.println("Connection URL=" + URL + ((localhost) ? " (localhost)" : ""));
    }

    @Test
    public void testKey() throws Exception {
        assumeNotNull(launch);
        String query = "SELECT key_id FROM lti_key WHERE key_sha256 = ? LIMIT 1;";
        PreparedStatement stmt = c.prepareStatement(query);
        stmt.setString(1, unitTestKeySha256);
        ResultSet rs = stmt.executeQuery();
        if (rs.next()) {
            key_id = rs.getLong("key_id");
            System.out.println("Found key_id="+key_id);
            return;
        }

        if ( ! localhost ) {
            System.out.println("Will not insert test key into non-local database");
            assertTrue(false);
            return;
        }

        query= "INSERT INTO lti_key (key_sha256, key_key, secret) VALUES ( ?, ?, ? )";
        stmt = c.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
        stmt.setString(1, unitTestKeySha256);
        stmt.setString(2, unitTestKey);
        stmt.setString(3, "secret");
        stmt.executeUpdate();
        rs = stmt.getGeneratedKeys();
        if (rs.next()) {
            Long key_id = rs.getLong(1);
            System.out.println("Inserted key_id="+key_id);
        }


    }
    
    @Test
    public void testFirstLaunchBasics() {
        assumeNotNull(launch);
        Properties f = fakePost1();
        assertTrue(launch.getContext().getId() > 0 );
        assertTrue(launch.getUser().getId() > 0 );
        assertTrue(launch.getLink().getId() > 0 );
        assertTrue(launch.getResult().getId() > 0 );
        assertTrue(launch.getService().getId() > 0 );
        assertTrue(launch.getUser().isInstructor());
        assertFalse(launch.getUser().isTenantAdmin());
        assertFalse(launch.getUser().isRootAdmin());
        assertNull(launch.getResult().getURL());
        assertEquals(f.getProperty("context_title"), launch.getContext().getTitle());
        assertEquals(f.getProperty("lis_person_contact_email_primary"), launch.getUser().getEmail());
        assertEquals(f.getProperty("resource_link_title"), launch.getLink().getTitle());
        assertEquals(f.getProperty("lis_result_sourcedid"), launch.getResult().getSourceDID());
        assertEquals(f.getProperty("lis_outcome_service_url"), launch.getService().getURL());
    }

    @Test
    public void testSecondLaunchBasics() {
        Properties f = fakePost1();

        Launch launch2 = tsugi.getLaunch(f);
        assertNotNull(launch2);
        assertFalse(launch2.getUser().isTenantAdmin());
        assertFalse(launch2.getUser().isRootAdmin());

        assertEquals(launch.getContext().getId(), launch2.getContext().getId() );
        assertEquals(launch.getUser().getId(), launch2.getUser().getId() );
        assertEquals(launch.getLink().getId(), launch2.getLink().getId() );
        assertEquals(launch.getResult().getId(), launch2.getResult().getId() );
        assertEquals(launch.getService().getId(), launch2.getService().getId() );
        assertEquals(launch.getUser().isInstructor(), launch2.getUser().isInstructor());
        assertEquals(f.getProperty("context_title"), launch.getContext().getTitle());
        assertEquals(f.getProperty("lis_person_contact_email_primary"), launch.getUser().getEmail());
        assertEquals(f.getProperty("resource_link_title"), launch.getLink().getTitle());
        assertEquals(f.getProperty("lis_result_sourcedid"), launch.getResult().getSourceDID());
        assertEquals(f.getProperty("lis_outcome_service_url"), launch.getService().getURL());
    }

    @Test
    public void testLTI2LaunchEquivalence() {
        Properties f1 = fakePost1();
        Properties f2 = fakePost2();

        System.out.println("Starting LTI 2.0 Launch test");
        Launch launch2 = tsugi.getLaunch(f2);
        assertNotNull(launch2);
        assertFalse(launch2.getUser().isTenantAdmin());
        assertFalse(launch2.getUser().isRootAdmin());
        assertEquals(launch.getContext().getId(), launch2.getContext().getId() );
        assertEquals(launch.getUser().getId(), launch2.getUser().getId() );
        assertEquals(launch.getLink().getId(), launch2.getLink().getId() );
        assertEquals(launch.getResult().getId(), launch2.getResult().getId() );
        assertEquals(f1.getProperty("context_title"), launch.getContext().getTitle());
        assertEquals(f1.getProperty("lis_person_contact_email_primary"), launch.getUser().getEmail());
        assertEquals(f1.getProperty("resource_link_title"), launch.getLink().getTitle());
        assertEquals(f2.getProperty("custom_result_url"), launch2.getResult().getURL());
        assertEquals(launch.getUser().isInstructor(), launch2.getUser().isInstructor());
        // assertEquals(f1.getProperty("resource_link_description"), launch.getLink().getDescription());
    }

    @Test
    public void testSettings() {
        assumeNotNull(launch);
        Settings contextSettings = launch.getContext().getSettings();
        contextSettings.setSetting("zap", "1234");
        Settings linkSettings = launch.getLink().getSettings();
        try {
            linkSettings.setSettingsJson("{ \"abc\" : 123 }");
        } catch (IOException ex) {
            System.out.println("Unexpected exception parsing JSON");
            ex.printStackTrace();
            assertTrue(false);
        }
    }


}
*/
