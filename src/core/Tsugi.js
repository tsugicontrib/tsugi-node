var Q = require("q");
var TsugiUtils = require("../util/TsugiUtils");
var Crypto = require("../util/Crypto");

/**
 *  The Tsugi class/namespace/Utilities
 *
 *  Calling sequence in a NodeJS app:
 *
 *      var CFG = require('./src/config/Config');
 *      var Tsugi = require('./src/core/Tsugi');
 *
 *      launch = Tsugi.requireData(CFG, req, res);
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

        /*
         * Way to signal to the class that it is being exercised in a unit test.
         */
        this.unit_testing = false;
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
     *     launch = tsugi.setup(CFG, req, res, session);
     *     if (launch.complete) return;
     *
     * @param {ConfigSample} CFG A Tsugi Configuration object
     * @param {http.ClientRequest} req
     * @param {http.ServerResponse} res
     * @param {*} A session object
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
    setup(CFG, req, res, session) {
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
     * @param {ConfigSample} CFG A Tsugi Configuration object
     * @param {http.ClientRequest} req
     * @param {http.ServerResponse} res
     * @param {*} A session object
     * @param {*} The body (i.e. POST data)
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
    requireData(CFG, req, res, body=null, session=null, needed=this.ALL) {

        let reqData = Q.defer();

        if ( ! ( needed instanceof Array ) ) {
            needed = [ needed ];
        }
        console.log(needed);
        let ns = new Set(needed);
        console.log(ns.has(this.ALL));

        body = body || req.body || req.payload;
        session = session || req.session ;

        let Launch = require('./Launch.js');

        /**
         * @type {Launch}
         */
        let launch = new Launch(CFG, req, res, session);

        if (!this.isRequest(body)) {
          if (session == null) {
            reqData.reject ('This tool must be launched using LTI')
          } else {
            let sess_row = session.lti_row;

            if (sess_row == null) {
              reqData.reject ('This tool must be launched using LTI or have LTI data in session');
            } else {
              launch.success = true;
              launch.fill(sess_row);
              reqData.resolve(launch);
            }
          }
        } else { //This already is a valid request

          // Start fresh in the session
          if ( session != null ) delete session.lti_row;

          // Pull in the POST data
          let post = this.extractPost(body, needed);

          if ( post == null ) {
              reqData.reject('Missing essential POST data');
          } else {
            // Pull in whatever old data we have (including secret)
            let topclass = this;

            this.loadAllData(CFG, post).then(function(rows) {
                console.log("Data Rows: ", rows.length);

                if ( rows.length < 1 ) {
                    console.log("Key not found "+post.key_key);
                    reqData.reject ('Key not found');
                } else {

                  let row = rows[0];

                  console.log('ROW',row);

                  let x = false;
                  let validated = false;

                  if ( req != null ) {
                    let key = row.key_key;
                    let secret = row.secret;
                    let new_secret = row.new_secret;
                    console.log("OAuth",key,secret,new_secret);

                    // checkOAuthSignature Returns three item array:
                    // [0] An error with member ".message" containing a textual message
                    // [1] true/false if it was validated
                    // [2] The base string or null

                    if ( new_secret != null ) {
                        x = topclass.checkOAuthSignature(launch, key, new_secret);
                        validated = x[1];
                    }
                    if ( !validated && secret != null ) {
                        x = topclass.checkOAuthSignature(launch, key, secret);
                        validated = x[1];
                    }

                    if ( !validated ) {
                      launch.message = x[0].message;
                      launch.error = true;
                      launch.base = x[2];
                      console.log("OAuth error: "+launch.message);
                      console.log("Base string: "+launch.base);

                      let returnUrl = req.body.launch_presentation_return_url
                      if ( returnUrl ) {
                        if ( returnUrl.indexOf('?') > 0 ) {
                            returnUrl += '&';
                        } else {
                            returnUrl += '?';
                        }
                        returnUrl += 'lti_errormsg=' + encodeURIComponent(x[0].message);
                        returnUrl += '&base=' + encodeURIComponent(x.base);
                        console.log(returnUrl);
                        res.redirect(returnUrl);
                        launch.complete = true;

                        //Although is an error lets return a valid result to be processd as complete response (redirect)
                        reqData.resolve (launch);
                      }
                    }
                  } else if ( this.unit_testing ) {
                      console.log("HttpServletRequest is null - test only");
                  } else {
                      throw new Error("HttpServletRequest is required unless Tsugi.unit_testing = true");
                  }

                  launch.success = true;

                  let adjust = topclass.adjustData(CFG, row, post);
                  adjust.then( function () {

                      launch.fill(row);

                      if ( session != null ) {
                          session.lti_row = row;

                          let redirect = TsugiUtils.requestUrl(req);
                          console.log("Redirecting back to "+redirect);
                          res.redirect(redirect);
                          launch.complete = true;
                          reqData.resolve (launch);
                      } else {
                          reqdata.reject('No session found');
                      }
                  }).catch (function (adjustError){
                    reqData.reject (adjustError);
                  });
                }
              })
              .catch (function (error){ //loadData went wrong
                reqData.reject (error);
              });
          }
      }
      return reqData.promise;
    }

    /**
     * Extract the data from POST
     *
     * @param {object} i The input post data
     * @param {*} needed Indicates which of
     * the data structures are needed. If this is omitted,
     * this assumes that CONTEXT, LINK, and USER data are required.
     * If NONE is present, then none of the three are rquired.
     * If some combination of the three are needed, this accepts
     * an array of the CONTEXT, LINK, and USER
     * can be passed in.
     * @type {object}
     */
    extractPost(i, needed=this.ALL) {


        let o = {};
        TsugiUtils.copy(o,"key_key",i,"oauth_consumer_key");
        TsugiUtils.copy(o,"nonce",i,"oauth_nonce");
        if ( o.key_key == null || o.nonce == null ) return null;

        TsugiUtils.copy(o,"link_key",i,"resource_link_id");
        TsugiUtils.copy(o,"context_key",i,"context_id", "custom_courseoffering_sourcedid");
        TsugiUtils.copy(o,"user_key",i,"user_id","custom_person_sourcedid");

        // Test for the required parameters.
        let ns = this.patchNeeded(needed);
        if ( o.user_key == null && (ns.has(this.ALL) || ns.has(this.USER)) ) return null;
        if ( o.context_key == null && (ns.has(this.ALL) || ns.has(this.CONTEXT)) ) return null;
        if ( o.link_key == null && (ns.has(this.ALL) || ns.has(this.LIN)) ) return null;

        // LTI 1.x settings and Outcomes
        TsugiUtils.copy(o,"service",i,"lis_outcome_service_url");
        TsugiUtils.copy(o,"sourcedid",i,"lis_result_sourcedid");

        // LTI 2.x settings and Outcomes
        TsugiUtils.copy(o,"result_url",i,"custom_result_url");
        TsugiUtils.copy(o,"link_settings_url",i,"custom_link_settings_url");
        TsugiUtils.copy(o,"context_settings_url",i,"custom_context_settings_url");

        // LTI 1.x / 2.x Service endpoints
        TsugiUtils.copy(o,"ext_memberships_id",i,"ext_memberships_id");
        TsugiUtils.copy(o,"ext_memberships_url",i,"ext_memberships_url");
        TsugiUtils.copy(o,"lineitems_url",i,"lineitems_url","custom_lineitems_url");
        TsugiUtils.copy(o,"memberships_url",i,"memberships_url", "custom_memberships_url");

        TsugiUtils.copy(o,"context_title",i,"context_title");
        TsugiUtils.copy(o,"link_title",i,"resource_link_title");

        // Getting email from LTI 1.x and LTI 2.x
        let email = TsugiUtils.toNull(i["lis_person_contact_email_primary"]);
        if ( email == null ) email = TsugiUtils.toNull(i["custom_person_email_primary"]);
        if ( email == null ) email = TsugiUtils.toNull(i["custom_person_contact_email_primary"]);
        if ( email != null ) o["user_email"] = email;

        TsugiUtils.copy(o,"user_image",i,"user_image", "custom_user_image");

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
            `SELECT k.key_id, k.key_key, k.secret, k.new_secret, c.settings_url AS key_settings_url,
            n.nonce,
            c.context_id, c.title AS context_title, context_sha256, c.settings AS context_settings,
            c.settings_url AS context_settings_url,
            c.ext_memberships_id AS ext_memberships_id, c.ext_memberships_url AS ext_memberships_url,
            c.lineitems_url AS lineitems_url, c.memberships_url AS memberships_url,
            l.link_id, l.title AS link_title, l.settings AS link_settings, l.settings_url AS link_settings_url,
            u.user_id, u.displayname AS user_displayname, u.email AS user_email, user_key, u.image AS user_image,
            u.subscribe AS subscribe, u.user_sha256 AS user_sha256,
            m.membership_id, m.role, m.role_override,
            r.result_id, r.grade, r.note AS result_comment, r.result_url, r.sourcedid
            `;

        if ( post["service"] != null ) {
            sql += `, s.service_id, s.service_key AS service
                   `;
        }

        sql +=
            `FROM {p}lti_key AS k
            LEFT JOIN {p}lti_nonce AS n ON k.key_id = n.key_id AND n.nonce = :nonce
            LEFT JOIN {p}lti_context AS c ON k.key_id = c.key_id AND c.context_sha256 = :context
            LEFT JOIN {p}lti_link AS l ON c.context_id = l.context_id AND l.link_sha256 = :link
            LEFT JOIN {p}lti_user AS u ON k.key_id = u.key_id AND u.user_sha256 = :user
            LEFT JOIN {p}lti_membership AS m ON u.user_id = m.user_id AND c.context_id = m.context_id
            LEFT JOIN {p}lti_result AS r ON u.user_id = r.user_id AND l.link_id = r.link_id
            `; //  :nonce 1 :context 2 :link 3 :user 4


        // Note that extractPost() insures these fields all exist in post
        let data = {nonce: post.nonce,
                context: Crypto.sha256(post.context_key),
                link: Crypto.sha256(post.link_key),
                user: Crypto.sha256(post.user_key),
                key: Crypto.sha256(post.key_key) };

        if ( post["service"] != null ) {
            sql += `LEFT JOIN {p}lti_service AS s ON k.key_id = s.key_id AND s.service_sha256 = :service
                   ` // :service 5

            data.service = Crypto.sha256(post.service);
        }

        sql += `WHERE k.key_sha256 = :key LIMIT 1
               `;  // :key 6 or 5

        //console.log(sql);
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
        // console.log("adjustData starting");
        // console.log(row);
        // console.log(post);

        // Here we go with some forced straight line async code NodeJS Style
        let actions = [];
        let oldserviceid = row.service_id;

        function contextHandling () {
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
        };

        function linkHandling () {
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
        };

        function userHandling () {
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
        };

        function membershipHandling () {
          console.log("MEMBERSHIP HANDLING");
          if ( row.membership_id == null && row.context_id != null && row.user_id != null ) {
              let sql = `INSERT INTO {p}lti_membership
                  ( context_id, user_id, role, created_at, updated_at ) VALUES
                  ( :context_id, :user_id, :role, NOW(), NOW() )`;
              let data = {
                  context_id: row.context_id,
                  user_id: row.user_id,
                  role: post.role
              };
              return CFG.pdox.insertKey(sql, data).then( function(insertId) {
                  row.membership_id = insertId;
                  row.role = post.role;
                  actions.push("=== Inserted membership id="+row.membership_id+" role="+row.role+
                      " user="+row.user_id+" context="+row.context_id);
              });
          }
        };

        function serviceHandling (){
          // We need to handle the case where the service URL changes but we already have a sourcedid
          // This is for LTI 1.x only as service is not used for LTI 2.x
          console.log("SERVICE HANDLING");
          if ( TsugiUtils.isset(post.service)) {
              if ( row.service_id === null && post.service ) {
                  let sql = `INSERT INTO {p}lti_service
                      ( service_key, service_sha256, key_id, created_at, updated_at ) VALUES
                      ( :service_key, :service_sha256, :key_id, NOW(), NOW() )`;
                  let data = {
                      service_key: post.service,
                      service_sha256: Crypto.sha256(post.service),
                      key_id: row.key_id
                  };
                  return CFG.pdox.insertKey(sql, data).then( function(insertId) {
                      row.service_id = insertId;
                      row.service = post.service;
                      actions.push( "=== Inserted service id="+row.service_id+" "+post.service);
                  });
              }
          }
        };

        function resultToServiceHandling () {
          console.log("RESULT TO SERVICE HANDLING");
          if ( TsugiUtils.isset(post.service)) {
              if ( oldserviceid === null && row.result_id !== null && row.service_id !== null && post.service ) {
                  let sql = "UPDATE {p}lti_result SET service_id = :service_id WHERE result_id = :result_id";
                  let data = {
                      service_id: row.service_id,
                      result_id: row.result_id
                  };
                  return CFG.pdox.query(sql, data).then( function() {
                      actions.push( "=== Updated result id="+row.result_id+" service="+row.service_id);
                  });
              }
          }
        };

        function resultHandling () {
          // console.log("RESULT HANDLING");
          // We always insert a result row if we have a link - we will store
          // grades locally in this row - even if we cannot send grades
          if ( row.result_id == null && row.link_id != null && row.user_id != null ) {
              let sql = `INSERT INTO {p}lti_result
                  ( link_id, user_id, created_at, updated_at ) VALUES
                  ( :link_id, :user_id, NOW(), NOW() )`;
              let data = {
                  link_id: row.link_id,
                  user_id: row.user_id
              };
              return CFG.pdox.insertKey(sql, data).then( function(insertId) {
                  row.result_id = insertId;
                  actions.push( "=== Inserted result id="+row.result_id);
              });
         }
        };

        function postTweeks () {
          console.log("POST TWEAKS");
          // Set these values to null if they were not in the post
          if ( ! TsugiUtils.isset(post.sourcedid) ) post.sourcedid = null;
          if ( ! TsugiUtils.isset(post.service) ) post.service = null;
          if ( ! TsugiUtils.isset(post.result_url) ) post.result_url = null;
          if ( ! TsugiUtils.isset(row.service) ) {
              row.service = null;
              row.service_id = null;
          }
        }

        function resultUpdate () {
          console.log("RESULT UPDATE");
          // Here we handle updates to sourcedid or result_url including if we
          // just inserted the result row

          if ( row.result_id != null &&
              (post.sourcedid != row.sourcedid || post.result_url != row.result_url ||
              post.service != row.service )
          ) {
              let sql = `UPDATE {p}lti_result
                  SET sourcedid = :sourcedid, result_url = :result_url, service_id = :service_id
                  WHERE result_id = :result_id`;
              let data = {
                  result_url: post.result_url,
                  sourcedid: post.sourcedid,
                  service_id: row.service_id,
                  result_id: row.result_id
              };
              return CFG.pdox.query(sql, data).then( function() {
                  row.sourcedid = post.sourcedid;
                  row.service = post.service;
                  row.result_url = post.result_url;
                  actions.push( "=== Updated result id="+row.result_id+" result_url="+row.result_url+
                  " sourcedid="+row.sourcedid+" service_id="+row.service_id);
              });
          }
        };

        function updateContext () {
          console.log("UPDATING CONTEXT");

          if ( row.context_id != null &&
                TsugiUtils.isset(post.context_title) && post.context_title != row.context_title ) {

              let sql = `UPDATE {p}lti_context SET title = :title WHERE context_id = :context_id`;
              let data = {
                  title: post.context_title,
                  context_id: row.context_id
              };
              return CFG.pdox.query(sql, data).then( function() {
                  row.context_title = post.context_title;
                  actions.push( "=== Updated context="+row.context_id+" title="+post.context_title);
              });
          }
        };

        function updateContextColumn (column) {
          console.log("UPDATING CONTEXT "+column);

          if ( row.context_id != null &&
                TsugiUtils.isset(post[column]) && post[column] != row[column] ) {

              let sql = `UPDATE {p}lti_context SET `+column+` = :value WHERE context_id = :context_id`;
              let data = {
                  value: post[column],
                  context_id: row.context_id
              };
              return CFG.pdox.query(sql, data).then( function() {
                  row[column] = post[column];
                  actions.push( "=== Updated context="+row.context_id+" "+column+"="+post[column]);
              });
          }
        };

        function updateLink () {
          console.log("UPDATING LINK");

          if ( row.link_id != null &&
               TsugiUtils.isset(post.link_title) && post.link_title != row.link_title ) {

              let sql = "UPDATE {p}lti_link SET title = :title WHERE link_id = :link_id";
              let data = {
                  title: post.link_title,
                  link_id: row.link_id
              };
              return CFG.pdox.query(sql, data).then( function() {
                  row.link_title = post.link_title;
                  actions.push( "=== Updated link="+row.link_id+" title="+post.link_title);
              });
          }
        };

        function updateUser(fieldname) {
          console.log("UPDATING USER "+fieldname);

          var post_name = "user_"+fieldname;
          if ( row.user_id != null &&
               TsugiUtils.isset(post[post_name]) && post[post_name] != row[fieldname] && post[post_name].length > 0 ) {
              let sql = "UPDATE {p}lti_user SET "+fieldname+" = :value WHERE user_id = :user_id";
              let data = {
                  value: post[post_name],
                  user_id: row.user_id
              };
              return CFG.pdox.query(sql, data).then( function() {
                  row[fieldname] = post[post_name];
                  actions.push( "=== Updated user="+row.user_id+" "+fieldname+"="+post[post_name]);
              });
          }
        };

        function updateEmail () {
          console.log("UPDATING EMAIL");

          if ( TsugiUtils.isset(post.user_email) && post.user_email != row.user_email && post.user_email.length > 0 ) {
              let sql = "UPDATE {p}lti_user SET email = :email WHERE user_id = :user_id";
              let data = {
                  email: post.user_email,
                  user_id: row.user_id
              };
              return CFG.pdox.query(sql, data).then( function() {
                  row.user_email = post.user_email;
                  actions.push( "=== Updated user="+row.user_id+" email="+post.user_email);
              });
          }
        };

        function updateRole (){
          console.log("UPDATING ROLE");

          if ( TsugiUtils.isset(post.role) && post.role != row.role ) {
              let sql = "UPDATE {p}lti_membership SET role = :role WHERE membership_id = :membership_id";
              let data = {
                  role: post.role,
                  membership_id: row.membership_id
              };
              return CFG.pdox.query(sql, data).then( function() {
                  row.role = post.role;
                  actions.push( "=== Updated membership="+row.membership_id+" role="+post.role);
              });
          }
        };

        var adjustSequence = Q.defer();

        TsugiUtils.emptyPromise()
        .then(contextHandling)
        .then(linkHandling)
        .then(userHandling)
        .then(membershipHandling)
        .then(serviceHandling)
        .then(resultToServiceHandling)
        .then(resultHandling)
        .then(postTweeks)
        .then(resultUpdate)
        .then(updateContext)
        .then(updateContextColumn('ext_memberships_id'))
        .then(updateContextColumn('ext_memberships_url'))
        .then(updateContextColumn('lineitems_url'))
        .then(updateContextColumn('memberships_url'))
        .then(updateLink)
        .then(updateUser('displayname'))
        .then(updateUser('image'))
        .then(updateEmail)
        .then(updateRole)
        .then(function (){
          // De-undefine the altered row data
          TsugiUtils.toNullAll(row);
          // console.log(row);
          if ( actions.length > 0 ) console.log("Actions", actions);
          adjustSequence.resolve(row);
        })
        .catch (function (error){
            console.log (error);
            adjustSequence.reject();
        });

        return adjustSequence.promise;
    }

    /*
     ** Returns true if this is an LTI message with minimum values to meet the protocol
     *
     * @param {*} needed Indicates which of
     *
     */
    isRequest(props) {
        let vers = props.lti_version;
        let mtype = props.lti_message_type;
        if ( vers == null || mtype == null ) return false;

        let good_message_type = mtype == ("basic-lti-launch-request" ||
            mtype == "ToolProxyReregistrationRequest" ||
            mtype == "ContentItemSelectionRequest");
        let good_lti_version = (vers == "LTI-1p0" || vers == "LTI-2p0");

        if (good_message_type && good_lti_version ) return true;
        return false;
    }

    /*
     ** Check the OAuth Signature
     */
    checkOAuthSignature(launch, key, secret) {
        // var lti = require('tsugi-node-lti/lib/ims-lti.js');
        let lti = launch.CFG.LTI;

        // provider = new lti.Provider '12345', 'secret', [nonce_store=MemoryStore], [signature_method=HMAC_SHA1]
        let provider = new lti.Provider (key, secret);

        // Returns three item array:
        // [0] An error with member ".message" containing a textual message
        // [1] true/false if it was validated
        // [2] The base string or null
        let x = provider.valid_request(launch.req, launch.req.body, function(x,y,z) { return [x,y,z];} );

        // console.log('YAYAYAYAYAYAYAYAY',x);

        return x;
    }

    /**
     * Patch the value for the list of needed features and return a Set
     *
     *     ns = this.patchNeeded(Tsugi.ALL)
     *     console.log(ns.has(this.ALL));
     *
     * or if you don't need link..
     *
     *     ns = this.patchNeeded([Tsugi.USER,Tsugi.CONTEXT]))
     *     console.log(ns.has(this.ALL));
     *
     *
     * Note - causes no harm if called more than once.
     *
     * @param {*} needed Indicates which of
     * the data structures are needed. If this is omitted,
     * this assumes that CONTEXT, LINK, and USER data are required.
     * If NONE is present, then none of the three are rquired.
     * If some combination of the three are needed, this accepts
     * an array of the CONTEXT, LINK, and USER
     * can be passed in.
     *
     * @return {Set} A set of the needed values
     */
    patchNeeded(needed) {

        if ( needed instanceof Set ) return needed;

        if ( needed == this.NONE ) return new Set();

        if ( needed == this.ALL ) {
            let ns = new Set([this.CONTEXT, this.USER, this.LINK]);
            return ns;
        }

        if ( ! ( needed instanceof Array ) ) {
            needed = [ needed ];
        }
        // console.log(needed);
        let ns = new Set(needed);
        return ns;
    }

}

module.exports = new Tsugi();
