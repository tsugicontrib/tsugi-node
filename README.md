Tsugi Node Library
==================

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

It is not a server - more of a simple straight line test.   You can
also run [nodemon](https://www.npmjs.com/package/nodemon) if you want it
to watch the folder and restart on any file change.

To make the documentation install [ESDOC](http://esdoc.org) and run:

    esdoc -c esdoc.json

And open `esdoc/index.html`
