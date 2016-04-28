
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
        let launch = new Launch(CFG);
        return launch;
    }

}

module.exports = new Tsugi();

