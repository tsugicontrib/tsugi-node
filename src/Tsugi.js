
var TsugiUtils = require("./TsugiUtils");
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

}

module.exports = new Tsugi();

