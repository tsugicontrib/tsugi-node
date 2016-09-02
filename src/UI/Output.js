var TsugiUtils = require('../util/TsugiUtils');
var express = require ('express');

/**
  * A Tsugi application makes use of this class as follows:
  *
  * <pre><code>
  *
  *      var  config = require('./src/config/Config'),
  *           CFG = new Config ();
  *      var  Tsugi = require('./src/core/Tsugi');
  *
  *      launch = Tsugi.requireData(CFG, req, res);
  *      if ( launch.complete ) return;
  *
  *      let o = new Output (launch);
  *      o.bodyStart();
  *      o.navStart(); // If you want it..
  *      o.flashMessages();
  *
  *      o.navEnd(); // If you started it
  *      res.write (`
  *         <section>
  *           <h1>Welcome to Tsugi Node</h1>
  *           <p>Tsugi Node is an NodeJS implementation of Tsugi libraries....</p>
  *         </section>
  *      `);
  *      o.footerStart();
  *
  *     // Some of my own JavaScript goodness
  *     res.write (`
  *       <script type="text/javascript">
  *         $(document).ready( ... );
  *     `);
  *
  *     o.footerEnd(out);
  * </code></pre>
  *
  * The header() only includes the CSS for the libraries.  The
  * the JavaScript librarys are included by footerStart().  This
  * is where the tool can add JQuery plugins or include JavaScript of its
  * own.
  *
  * The implementation of this class is likely to evolve quite a bit
  * as we someday add features to LMS systems like Sakai and OAE to share
  * their navigation bits with Tsugi tools.  So don't dig too deep into
  * the implementations or hack the static files too much.
  */

var TSUGI_SESSION_SUCCESS = 'tsugi::session::success',
    TSUGI_SESSION_ERROR   = 'tsugi::session::error';

class Output {

  constructor(launch) {
    this.req = launch.request;
    this.res = launch.response;
    this.session = this.req.session;
    this.staticPath = launch.staticUrl;
  }

  flashSuccess (message) {
    if (this.session==null) return;
    this.session[TSUGI_SESSION_SUCCESS] = message;
  }

  flashError (message) {
    if (this.session==null) return;
    this.session[TSUGI_SESSION_ERROR] = message;
  }

  flashMessages () {
    if (this.session==null) return;
    let error = this.session[TSUGI_SESSION_ERROR];
    let success = this.session[TSUGI_SESSION_SUCCESS];

    delete this.session[TSUGI_SESSION_ERROR];
    delete this.session[TSUGI_SESSION_SUCCESS];

    if (TsugiUtils.isset (error)){
      this.res.write (
          `<div class="alert alert-danger">
            <a href="#" class="close" data-dismiss="alert">&times;</a>
            ${error}
          </div>
          `
      );
    }

    if (TsugiUtils.isset (success)){
      this.res.write (
          `<div class="alert alert-success">
            <a href="#" class="close" data-dismiss="alert">&times;</a>
            ${success}
          </div>
          `
      );
    }
  }

  header () {
    this.res.write (`
    <!DOCTYPE html>
    <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" >
      <meta name="viewport" content="width=device-width, initial-scale=1.0" >

      <link href="${this.staticPath}/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
      <link href="${this.staticPath}/components-font-awesome/css/font-awesome.min.css" rel="stylesheet">
      `);
    }

  bodyStart () {
    this.res.write (`
    </head>
    <body style="padding: 15px;">`);
  }

  footerStart () {
    this.res.write (`
      <script src="${this.staticPath}/jquery/dist/jquery.min.js"></script>
      <script src="${this.staticPath}/bootstrap/dist/js/bootstrap.min.js"></script>
    `);
  }

  footerEnd () {
    this.res.write(`
    </body>
    </html>
    `);
  }

  navStart () {

  }

  navEnd() {

  }

}

module.exports = Output;
