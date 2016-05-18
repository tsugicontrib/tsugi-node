var Q = require("q");

/**
 * Routines to handle connection chores.
 * https://www.npmjs.com/package/mysql
 */
class PDOX {

    constructor(CFG) {
console.log("PDOX is being constructed!");

        // Make the database connection and pool once at the beginning
        this.pool = null;
        this.connection = null;
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host     : CFG.dbhost,
            port     : CFG.dbport,
            database : CFG.dbname,
            user     : CFG.dbuser,
            password : CFG.dbpass
        });
        connection.connect();

        // Test to see if the connection is alive
        this.setupFormat(connection);
        this.testConnection(connection);

        /**
         * A MySql Connection
         * https://www.npmjs.com/package/mysql
         */
        this.connection = connection;


        // Also create a MySql pool
        var pool  = mysql.createPool({
            host     : CFG.dbhost,
            port     : CFG.dbport,
            database : CFG.dbname,
            // TODO: Pool parameters
            user     : CFG.dbuser,
            password : CFG.dbpass
        });

        // Test the pool (async)
        this.testPool(pool);

        /**
         * A MySql Pool - does not yes suport the :title syntax
         * https://www.npmjs.com/package/mysql
         */
        this.pool = pool;
        // TODO: Make this handle the :title syntax
/*
        // Test for the existence of the data tables
        let cop = this.cop;  // Get a connection promise
        var prefix = this.dbprefix;
        cop.then( function(cop) {
            this.testTables(cop, prefix);
        });
*/

    }
    /**
     * Make the PDO-style format substitutions work
     *
     * https://www.npmjs.com/package/mysql#preparing-queries
     *
     *     connection.query("UPDATE posts SET title = :title", 
     *         { title: "Hello MySQL" });
     */
    setupFormat(connection) {
        connection.config.queryFormat = function (query, values) {
            if (!values) return query;
            return query.replace(/\:(\w+)/g, function (txt, key) {
                if (values.hasOwnProperty(key)) {
                    return this.escape(values[key]);
                }
                return txt;
            }.bind(this));
        };
    }

    /**
     * Test the connection
     */
    testConnection(connection) {
        connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
            if (err) {
                console.log("Unable to make database connection");
                console.log("This could be incorrect configuration or missing database");
                console.log("Here are the rough instructions to make the database tables:");
                console.log("   CREATE DATABASE tsugi DEFAULT CHARACTER SET utf8;");
                console.log("   GRANT ALL ON tsugi.* TO 'ltiuser'@'localhost' IDENTIFIED BY 'ltipassword';");
                console.log("   GRANT ALL ON tsugi.* TO 'ltiuser'@'127.0.0.1' IDENTIFIED BY 'ltipassword';");
                throw err;
            }
            console.log('Connection test success');
        });
    }

    /**
     * Test the pool
     */
    testPool(pool) {
        pool.getConnection(function(err, conn){
            conn.query("SELECT 1 + 1 AS solution", function(err, rows) {
                if (err) {
                    console.log("Unable to make database pool");
                    throw err;
                }
                console.log('Pool test success');
            })
        });
    }

    /**
     * Test the presence of tables
     * https://www.npmjs.com/package/mysql
     */
    testTables(connection, dbprefix) {
        let sql = 'SELECT * FROM '+dbprefix+'lti_key WHERE key_key = :key_key';
        connection.query(sql, { key_key:'12345' }, function(err, rows, fields) {
            if (err) {
                console.log('Could not load data query', sql);
                console.log('You need to install the Tsugi application console (a PHP app)');
                console.log('and use the Admin functionality to create the Tsugi tables');
                console.log('to initialize this application.');
                throw err;
            }
            console.log('Table test success');
            // console.log(rows);
        });
    }

    /**
     * Get a connection promise from the pool
     * Make sure to do a conn.release()
     *
     *     var thekey = '12345';
     *     pdox.cop.then( function(connection) {
     *         let sql = 'SELECT * FROM lti_key WHERE key_key = :key';
     *         connection.query(sql, { key: thekey }, function(err, rows, fields) {
     *             if (err) {
     *                 console.log('Could not load data query', sql);
     *             } else {
     *                 console.log(sql);
     *                 console.log("Rows:",rows.length);
     *             }
     *             connection.release();
     *         });
     *     });
     */
    cop() {
        var deferred = Q.defer();
        var setupFormat = this.setupFormat;
        this.pool.getConnection(function(err, connection) {
            if(err) {
                deferred.reject(err);
            } else {
                setupFormat(connection);
                deferred.resolve(connection);
            }
        });
        return deferred.promise;
    }

    /**
     * Run a query and return all the rows from the query and throw any error.
     *
     *     let sql = 'SELECT * FROM lti_key WHERE key_key = :key_key';
     *     CFG.pdox.allRowsDie(sql,{ key_key: thekey }).then( 
     *          function(rows) {
     *              console.log("Rows:",rows.length);
     *          }, 
     *          function(reason) { 
     *               console.log("Bummer",reason); 
     *          }
     *     );
     *
     * @param {string} sql The SQL to use
     * @param {object} data The key-value pairs for substitution
     */
    allRowsDie(sql, data=null) {
        return this.allRows(sql,data,true);
    }

    /**
     * Run a query and return all the rows or an error from the query.
     *
     *     let sql = 'SELECT * FROM lti_key WHERE key_key = :key_key';
     *     CFG.pdox.allRows(sql,{ key_key: thekey }, false).then( 
     *          function(rows) {
     *              console.log("Rows:",rows.length);
     *          }, 
     *          function(reason) { 
     *               console.log("Bummer",reason); 
     *          }
     *     );
     */
    allRows(sql, data=null, dothrow=false) {
        // console.log("allRowsDie",sql); console.log("   ",data);
        var deferred = Q.defer();
        this.cop().then( function(connection) {
            connection.query(sql, data, function(err, rows, fields) {
                if (err) {
                    let myerror = 'Could not load data query '+sql;
                    console.log(myerror);
                    console.log(data);
                    if ( dothrow )  throw myerror;
                    deferred.reject('Could not load data query', sql);
                } else {
                    // console.log('query die returning rows:', rows.length);
                    deferred.resolve(rows);
                }
                connection.release();
            });
        });
        return deferred.promise;
    }

}
    
module.exports = PDOX;
