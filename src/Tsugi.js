
// import User from "User";

/**
 *  The Tsugi class/namespace
 */
class Tsugi {

    /**
     * Handle launch and/or set up the LTI session and global variables
     *
     * Make sure we have the values we need in the LTI session
     * This routine will not start a session if none exists.  It will
     * die is there if no session_name() (PHPSESSID) cookie or
     * parameter.  No need to create any fresh sessions here.
     *
     * @param {Config} A Tsugi Configuration object
     *
     * @param {string} needed Indicates which of
     * the data structures are needed. If this is omitted,
     * this assumes that CONTEXT, LINK, and USER data are required.
     * If LTIX::NONE is present, then none of the three are rquired.
     * If some combination of the three are needed, this accepts
     * an array of the LTIX::CONTEXT, LTIX: LINK, and LTIX::USER
     * can be passed in.
     * 
     * @return Launch A Tsugi Launch object.
     */
    requireData(CFG, needed) {
        let Launch = require('./Launch.js');
        let launch = new Launch(CFG);
        return launch;
    }

}

module.exports = Tsugi;

