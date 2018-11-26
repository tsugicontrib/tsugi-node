Tsugi Node Library
==================

**Deprecated:** As of November 2018, this effort is deprecated.
We are in the process of developing a new technology / apprach
that will allow Tsugi tools to be built in a wide range of environments
connected to the core of Tsugi using web services wather than through
the database as is done in this approach.

We are using NodeJS 6.0, ES6, and Express for the Node version of Tsugi.

* [API Documentation](http://do1.dr-chuck.com/tsugi-node/esdoc/)

We are using an OO model where we need to work with all of these simultaneously:

* ES6
* NodeJS require pattern
* esdoc

Of course do this after downloading:

    npm install

It would be necessary to install bower to deploy static client libraries. If you
don't have it installed run

    npm install -g bower

To run test code:

    mocha

To run the test code on MAMP, do

    export PORT=8889; mocha

It is not a server - more of a simple straight line test.   You can
also run [nodemon](https://www.npmjs.com/package/nodemon) if you want it
to watch the folder and restart on any file change.

To make the documentation install [ESDOC](http://esdoc.org) and run:

    esdoc -c esdoc.json

And open `esdoc/index.html`

Developer Testing New Versions of tsugi-node-lti
------------------------------------------------

If you want to work on `tsugi-node-lti` and test it here, check it
our into a per folder and change `package.json` as follows:

    "tsugi-node-lti": "../tsugi-node-lti",

Then

    rm -r node_modules
    npm install

Now the install should be from your own hard drive rather than
npmjs.

    

