
var TsugiUtils = require("./TsugiUtils");
var Crypto = require("./Crypto");

/**
 *  The Tsugi class/namespace/Utilities
 * 
 *  Calling sequence in a NodeJS app:
 *
 *      var CFG = require('./Config');
 *      var Tsugi = require('./src/Tsugi');
 *
 *      launch = Tsugi.requireData(CFG, Tsugi.ALL);
 *      if ( launch.complete ) return;
 */
class Tsugi {

    // http://stackoverflow.com/questions/32647215/declaring-static-constants-in-es6-classes
    constructor() {
        /**
         * 
         */
        this.CONTEXT = "context_id";
        this.USER = "user_id";
        this.LINK = "link_id";
        this.ALL = "all";
        this.NONE = "none";
    }

    /**
     * Optionally handle launch and/or set up the LTI session variables
     *
     * This will set up as much of the user, context, link,
     * and result data as it can including leaving them all null
     * if this is called on a request with no LTI launch and no LTI
     * data in the session.  This expects req.session to be properly
     * set up as it may read and / or write session data.  If this 
     * encounters a LTI launch (POST) it might redirect and indicate
     * that this request is now complete.
     * 
     * Calling sequence:
     * 
     *     launch = tsugi.setup(CFG, req, res);
     *     if (launch.complete) return;
     *
     * @param {ConfigSample} CFG A Tsugi Configuration object
     * @param {http.ClientRequest} req 
     * @param {http.ServerResponse} res 
     *
     * @return Launch A Tsugi Launch object.
     */
    setup(CFG, req, res) {
        return this.requireData(CFG, this.NONE);
    }

    /**
     * Handle launch and/or set up the LTI session and global variables
     *
     * Make sure we have the values we need in the LTI session
     * This routine will not start a session if none exists.  It will
     * die is there if no session_name() (PHPSESSID) cookie or
     * parameter.  No need to create any fresh sessions here.
     *
     * @param {Config} CFG A Tsugi Configuration object
     *
     * @param {*} needed Indicates which of
     * the data structures are needed. If this is omitted,
     * this assumes that CONTEXT, LINK, and USER data are required.
     * If NONE is present, then none of the three are rquired.
     * If some combination of the three are needed, this accepts
     * an array of the CONTEXT, LINK, and USER
     * can be passed in.
     * 
     * @return Launch A Tsugi Launch object.
     */
    requireData(CFG, needed=this.ALL) {
        if ( ! ( needed instanceof Array ) ) {
            needed = [ needed ];
        }
        console.log(needed);
        let ns = new Set(needed);
        console.log(ns.has("all"));

        let Launch = require('./Launch.js');

        /**
         * @type {Launch}
         */
        let launch = new Launch(CFG);
        return launch;
    }

    /**
     * Extract the data from POST
     *
     * @param {object} i The input post data
     * @type {object}
     */
    extractPost(i) {
        let o = {};
        TsugiUtils.copy(o,"key_key",i,"oauth_consumer_key");
        TsugiUtils.copy(o,"nonce",i,"oauth_nonce");
        TsugiUtils.copy(o,"link_key",i,"resource_link_id");
        TsugiUtils.copy(o,"context_key",i,"context_id", "custom_courseoffering_sourcedid");
        TsugiUtils.copy(o,"user_key",i,"user_id","custom_person_sourcedid");

        // Test for the required parameters.
        if ( o.key_key != null && o.nonce != null && o.context_key != null &&
             o.link_key != null  && o.user_key != null  ) {
            // OK To Continue
        } else {
            return null;
        }

        // LTI 1.x settings and Outcomes
        TsugiUtils.copy(o,"service",i,"lis_outcome_service_url");
        TsugiUtils.copy(o,"sourcedid",i,"lis_result_sourcedid");

        // LTI 2.x settings and Outcomes
        TsugiUtils.copy(o,"result_url",i,"custom_result_url");
        TsugiUtils.copy(o,"link_settings_url",i,"custom_link_settings_url");
        TsugiUtils.copy(o,"context_settings_url",i,"custom_context_settings_url");

        TsugiUtils.copy(o,"context_title",i,"context_title");
        TsugiUtils.copy(o,"link_title",i,"resource_link_title");

        // Getting email from LTI 1.x and LTI 2.x
        let email = i["lis_person_contact_email_primary"];
        if ( email == null ) email = i["custom_person_email_primary"];
        if ( email != null ) o["user_email"] = email;

       // Displayname from LTI 2.x
        if ( i["person_name_full"] != null ) {
            TsugiUtils.copy(o,"user_displayname",i,"custom_person_name_full");
        } else if ( i["custom_person_name_given"] != null && i["custom_person_name_family"] != null ) {
            o["user_displayname"] = i["custom_person_name_given"]+" "+i["custom_person_name_family"];
        } else if ( i["custom_person_name_given"] != null ) {
            TsugiUtils.copy(o,"user_displayname",i,"custom_person_name_given");
        } else if ( i["custom_person_name_family"] != null ) {
            TsugiUtils.copy(o,"user_displayname",i,"custom_person_name_family");

        // Displayname from LTI 1.x
        } else if ( i["lis_person_name_full"] != null ) {
            TsugiUtils.copy(o,"user_displayname",i,"lis_person_name_full");
        } else if ( i["lis_person_name_given"] != null && i["lis_person_name_family"] != null ) {
            o["user_displayname"] = i["lis_person_name_given"]+" "+i["lis_person_name_family"];
        } else if ( i["lis_person_name_given"] != null ) {
            TsugiUtils.copy(o,"user_displayname",i,"lis_person_name_given");
        } else if ( i["lis_person_name_family"] != null ) {
            TsugiUtils.copy(o,"user_displayname",i,"lis_person_name_family");
        }

        let LEARNER_ROLE = "0";
        let INSTRUCTOR_ROLE = "1000";
        let TENANT_ADMIN_ROLE = "5000";
        let ROOT_ADMIN_ROLE = "10000";

        // Get the role
        o["role"] = LEARNER_ROLE;
        let roles = "";
        if ( i["custom_membership_role"] != null ) { // From LTI 2.x
            roles = i["custom_membership_role"];
        } else if ( i["roles"] != null ) { // From LTI 1.x
            roles = i["roles"];
        }

        if ( roles.length > 0 ) {
            roles = roles.toLowerCase();
            if ( roles.indexOf("instructor") >= 0 ) o["role"] = INSTRUCTOR_ROLE;
            if ( roles.indexOf("administrator") >= 0 ) o["role"] = TENANT_ADMIN_ROLE;
        }

        return o;
    }

    // TODO: Make sure to do nonce cleanup

    /**
     * Load the data from our lti_ tables using one long LEFT JOIN
     *
     * This data may or may not exist - hence the use of the long
     * LEFT JOIN.
     *
     * @param {Config} CFG A Tsugi Configuration object
     * @param {object} post The post data
     */
    loadAllData(CFG, post)
    {
        let sql =
            "SELECT k.key_id, k.key_key, k.secret, k.new_secret, c.settings_url AS key_settings_url, \n" +
            "n.nonce, \n" +
            "c.context_id, c.title AS context_title, context_sha256, c.settings AS context_settings, \n" +
            "c.settings_url AS context_settings_url,\n"+
            "l.link_id, l.title AS link_title, l.settings AS link_settings, l.settings_url AS link_settings_url,\n"+
            "u.user_id, u.displayname AS user_displayname, u.email AS user_email, user_key,\n"+
            "u.subscribe AS subscribe, u.user_sha256 AS user_sha256,\n"+
            "m.membership_id, m.role, m.role_override,\n"+
            "r.result_id, r.grade, r.note AS result_comment, r.result_url, r.sourcedid";

        if ( post["service"] != null ) {
            sql += ",\n" +
            "s.service_id, s.service_key AS service";
        }

        sql += "\nFROM {p}lti_key AS k\n" +
            "LEFT JOIN {p}lti_nonce AS n ON k.key_id = n.key_id AND n.nonce = :nonce\n" + // :nonce 1
            "LEFT JOIN {p}lti_context AS c ON k.key_id = c.key_id AND c.context_sha256 = :context\n" + // :context 2
            "LEFT JOIN {p}lti_link AS l ON c.context_id = l.context_id AND l.link_sha256 = :link\n" + // :link 3
            "LEFT JOIN {p}lti_user AS u ON k.key_id = u.key_id AND u.user_sha256 = :user\n" + // :user 4
            "LEFT JOIN {p}lti_membership AS m ON u.user_id = m.user_id AND c.context_id = m.context_id\n" +
            "LEFT JOIN {p}lti_result AS r ON u.user_id = r.user_id AND l.link_id = r.link_id";

        // Note that extractPost() insures these fields all exist in post
        let data = {nonce: post.nonce,
                context: Crypto.sha256(post.context_key),
                link: Crypto.sha256(post.link_key),
                user: Crypto.sha256(post.user_key),
                key: Crypto.sha256(post.key_key) };

        if ( post["service"] != null ) {
            sql += "\n"+
            "LEFT JOIN {p}lti_service AS s ON k.key_id = s.key_id AND s.service_sha256 = :service"; // :service 5
            data.service = Crypto.sha256(post.service);
        }

        sql += "\nWHERE k.key_sha256 = :key LIMIT 1\n";  // :key 6 or 5

        // console.log(sql);
        // console.log(data);

        // Return a promise of a query.
        return CFG.pdox.allRowsDie(sql, data);
    }


    /**
     * Make sure that the data in our lti_ tables matches the POST data
     *
     * This routine compares the POST data with the data pulled from the
     * lti_ tables and goes through carefully INSERTing or UPDATING
     * all the nexessary data in the lti_ tables to make sure that
     * the lti_ table correctly match all the data from the incoming post.
     *
     * While this looks like a lot of INSERT and UPDATE statements,
     * the INSERT statements only run when we see a new user/course/link
     * for the first time and after that, we only update is something
     * changes.   So in a high percentage of launches we are not seeing
     * any new or updated data and so this code just falls through and
     * does absolutely no SQL.
     *
     * @param {Config} CFG A Tsugi Configuration object
     * @param {object} row The row data (from loadAllData)
     * @param {object} post The post data
     */
    adjustData(CFG, row, post)
    {
        let sql = null;

console.log("adjustData starting");
console.log(row);
console.log(post);
        // Connect the user to the key
        let user_displayname = post["user_displayname"];
        let user_email = post["user_email"];

        // Here we go with some forced straight line async code NodeJS Style

        let actions = [];
        TsugiUtils.emptyPromise().then( function() {
            console.log("CONTEXT HANDLING");
            if ( row.context_id == null) {
                let sql = `INSERT INTO {p}lti_context
                    ( context_key, context_sha256, settings_url, title, key_id, created_at, updated_at ) VALUES
                    ( :context_key, :context_sha256, :settings_url, :title, :key_id, NOW(), NOW() )`;

                let data = {
                    context_key: post.context_key,
                    context_sha256: Crypto.sha256(post.context_key),
                    settings_url: post.context_settings_url,
                    title: post.context_title,
                    key_id: row.key_id
                };

                return CFG.pdox.insertKey(sql, data).then( function(insertId) {
                    row.context_id = insertId;
                    row.context_title = post.context_title;
                    row.context_settings_url = post.context_settings_url;
                    actions.push("=== Inserted context id="+row.context_id+" "+row.context_title);
                });
            } 
        }).then( function() {
            console.log("LINK HANDLING");
            if ( row.link_id == null) {
                let sql = `INSERT INTO {p}lti_link
                    ( link_key, link_sha256, settings_url, title, context_id, created_at, updated_at ) VALUES
                    ( :link_key, :link_sha256, :settings_url, :title, :context_id, NOW(), NOW() )`;

                let data = {
                    link_key: post.link_key,
                    link_sha256: Crypto.sha256(post.link_key),
                    settings_url: post.link_settings_url,
                    title: post.link_title,
                    context_id: row.context_id,
                    key_id: row.key_id
                };

                return CFG.pdox.insertKey(sql, data).then( function(insertId) {
                    row.link_id = insertId;
                    row.link_title = post.link_title;
                    row.link_settings_url = post.link_settings_url;
                    actions.push("=== Inserted link id="+row.link_id+" "+row.link_title);
                });
            } 
        }).then( function() {
            console.log("USER HANDLING");
            if ( row.user_id == null) {
                let sql = `INSERT INTO {p}lti_user
                    ( user_key, user_sha256, displayname, email, key_id, created_at, updated_at ) VALUES
                    ( :user_key, :user_sha256, :displayname, :email, :key_id, NOW(), NOW() )`;

                let data = {
                    user_key: post.user_key,
                    user_sha256: Crypto.sha256(post.user_key),
                    displayname: post.user_displayname,
                    email: post.user_email,
                    key_id: row.key_id
                };

                return CFG.pdox.insertKey(sql, data).then( function(insertId) {
                    row.user_id = insertId;
                    row.user_displayname = post.user_displayname;
                    row.email = post.email;
                    actions.push("=== Inserted user id="+row.user_id+" "+row.user_displayname);
                });
            } 
        }).then( function() {
            console.log("EEEEEEE");
            // De-undefine the altered row data
            TsugiUtils.toNullAll(row);
            console.log(row);
            console.log("Actions", actions);
        });
            
        
    }

}

module.exports = new Tsugi();

