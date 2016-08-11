var Q = require("q");
var mysql = require("mysql");

/**
 * Routines to handle connection chores.
 * https://www.npmjs.com/package/mysql
 */
class PDOX {

    /**
     * Create the database conection pools.
     * @param {Config} Configuration object
     */
    constructor(CFG) {
        /**
         * A reference to the configuration object
         *
         * @private
         */
        this._CFG = CFG;  // Retain for leter

        /**
         * The database pool (private)
         * https://www.npmjs.com/package/mysql#pooling-connections
         *
         * @private
         */
        this._pool = null;

        // Create a MySql pool
        var pool  = mysql.createPool({
            host     : CFG.dbhost,
            port     : CFG.dbport,
            database : CFG.dbname,
            // TODO: Pool parameters
            user     : CFG.dbuser,
            password : CFG.dbpass
        });

        // Test the pool (async - will fail later)
/*
        this._testPool(pool).then(function (message) {
            console.log(message);
        });
*/
        this._pool = pool;
    }

    /**
     * Replace {p} with the configured database table prefix.
     */
    setPrefix(sql) {
        return sql.replace(/{p}/g, this._CFG.dbprefix);
    }

    /**
     * Dp field Substitution
     */
    static substituteFields(conn, sql, data) {
        let retval = sql.replace(/\:(\w+)/g, function (txt, key) {
            if (data.hasOwnProperty(key)) {
                if ( typeof data[key] == 'undefined' || data[key] === null ) {
                    console.log("NULL at",key);
                    return 'NULL';
                }
                return conn.escape(data[key]);
            }
            console.log("Warning: substitution key not found:",key);
            return txt;
        });
        return retval;
    }

    /**
     * Make the PDO-style format substitutions work
     *
     * https://www.npmjs.com/package/mysql#preparing-queries
     *
     *     connection.query("UPDATE posts SET title = :title",
     *         { title: "Hello MySQL" });
     *
     * @private
     */
    _setupFormat(connection) {
        connection.config.queryFormat = function (query, values) {
            if (!values) return query;
            return query.replace(/\:(\w+)/g, function (txt, key) {
                if (values.hasOwnProperty(key)) {
                    if ( typeof values[key] == 'undefined' || values[key] === null ) {
                        // console.log("NULL at",key);
                        return 'NULL';
                    }
                    return this.escape(values[key]);
                }
                console.log("Warning: substitution key not found:",key);
                return txt;
            }.bind(this));
        };
     }

    /**
     * Test the pool
     *
     * @private
     */
    _testPool(pool) {
        var deferred = Q.defer();
        pool.getConnection(function(err, conn){
            conn.query("SELECT 1 + 1 AS solution", function(err, rows) {
                if (err) {
                    console.log("Unable to make database pool");
                    console.log("This could be incorrect configuration or missing database");
                    console.log("Here are the rough instructions to make the database tables:");
                    console.log("   CREATE DATABASE tsugi DEFAULT CHARACTER SET utf8;");
                    console.log("   GRANT ALL ON tsugi.* TO 'ltiuser'@'localhost' IDENTIFIED BY 'ltipassword';");
                    console.log("   GRANT ALL ON tsugi.* TO 'ltiuser'@'127.0.0.1' IDENTIFIED BY 'ltipassword';");
                    conn.release();
                    deferred.reject(err);
                }
                conn.release();
                deferred.resolve('Pool test success');
            })
        });
        return deferred.promise;
    }

    /**
     * Get a connection promise from the pool
     * Make sure to do a cop.release()
     *
     *     var thekey = '12345';
     *     pdox.cop.then( function(connection) {
     *         let sql = 'SELECT * FROM lti_key WHERE key_key = :key';
     *         connection.query(sql, { key: thekey }, function(err, rows, fields) {
     *             if (err) {
     *                 console.log('Could not load data query');
     *             } else {
     *                 console.log("Rows:",rows.length);
     *             }
     *             connection.release();
     *         });
     *     });
     */
    cop() {
        var deferred = Q.defer();
        var setupFormat = this._setupFormat;
        this._pool.getConnection(function(err, connection) {
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
     *     let sql = 'SELECT * FROM {p}lti_key WHERE key_key = :key_key';
     *     pdox.allRowsDie(sql,{ key_key: thekey }).then(
     *          function(rows) {
     *              console.log("Rows:",rows.length);
     *          },
     *          function(reason) {
     *               console.log("Bummer",reason);
     *          }
     *     );
     *
     * @param {string} sql The SQL to use - it is ok to use {p} for
     * the database prefix.
     * @param {object} data The key-value pairs for substitution
     */
    allRowsDie(sql, data=null) {
        return this.allRows(sql,data,true);
    }

    /**
     * Run a query and return all the rows or an error from the query.
     *
     *     let sql = 'SELECT * FROM lti_key WHERE key_key = :key_key';
     *     pdox.allRows(sql,{ key_key: thekey }, false).then(
     *          function(rows) {
     *              console.log("Rows:",rows.length);
     *          },
     *          function(reason) {
     *               console.log("Bummer",reason);
     *          }
     *     );
     *
     * @param {string} sql The SQL to use - it is ok to use {p} for
     * the database prefix - must be SELECT
     * @param {object} data The key-value pairs for substitution
     * @param {boolean} dothrow Whether to throw or return the error
     */
    allRows(sql, data=null, dothrow=false) {
        // console.log("allRowsDie",sql); console.log("   ",data);
        var deferred = Q.defer();
        sql = this.setPrefix(sql);
        this.cop().then( function(connection) {
            sql = PDOX.substituteFields(connection, sql, data);

            connection.query(sql, data, function(err, rows, fields) {
                if (err) {
                    console.log('Could not load data query');
                    console.log(sql);
                    console.log(data);
                    connection.release();
                    let myerror = 'Could not load data query '+sql;
                    if ( dothrow )  {
                      deferred.reject(myerror);
                    } else {
                      deferred.resolve(myerror);
                    }

                } else {
                    // console.log('query die returning rows:', rows.length);
                    connection.release();
                    deferred.resolve(rows);
                }
            });
        }).catch (function (connectionError) {
            deferred.reject (connectionError);
        });
        return deferred.promise;
    }

    /**
     * Run a query and return the number of affected rows, throw on error
     *
     *     sql = "DELETE FROM {p}lti_unit_test WHERE name='tsugi'";
     *     pdox.query(sql).then( function(retval) {
     *          console.log("DELETE retval:",retval);
     *     });
     *
     * @param {string} sql The SQL to use - it is ok to use {p} for
     * the database prefix - must not be a SELECT
     * @param {object} data The key-value pairs for substitution (optional)
     */
    query(sql, data=null) {
        return this.queryFull(sql, data, 0, true);
    }

    /**
     * Run a query and return the number of changed rows, throw on error
     *
     *     sql = "UPDATE {p}lti_unit_test SET email=:new WHERE name='tsugi'";
     *     pdox.queryChanged(sql, {new:'tsugi@fred.com'}).then(
     *         function(retval) {
     *             console.log("UPDATE retval:",retval);
     *         }
     *     );
     *
     * @param {string} sql The SQL to use - it is ok to use {p} for
     * the database prefix - must not be a SELECT
     * @param {object} data The key-value pairs for substitution (optional)
     */
    queryChanged(sql, data=null) {
        return this.queryFull(sql, data, 1, true);
    }

    /**
     * Run an INSERT and return the generated key, throw on error
     *
     *     sql = "INSERT INTO {p}lti_unit_test (name,email)
     *            VALUES ('tsugi', 'tsugi@zap.com')";
     *     pdox.insertKey(sql).then( function(retval) {
     *          console.log("INSERT retval:",retval);
     *     });
     *
     * @param {string} sql The SQL to use - it is ok to use {p} for
     * the database prefix - must be an INSERT to a table with
     * an auto-increment field.
     * @param {object} data The key-value pairs for substitution (optional)
     */
    insertKey(sql, data=null) {
        return this.queryFull(sql, data, 2, true);
    }

    /**
     * Run a query and return the appropriate result for the query
     *
     * This has more parameters and is typically used by methods with
     * simpler signatures.
     *
     * @param {string} sql The SQL to use - it is ok to use {p} for
     * the database prefix - must not be SELECT.
     * @param {object} data The key-value pairs for substitution
     * @param {number} returnval What to return from the function.
     * 0=rows affected, 1=rows changed, 2=last insert id
     * @param {boolean} dothrow Whether to throw or return the error
     */
    queryFull(sql, data=null, returnval=0, dothrow=false) {
        // console.log("queryFull",sql); console.log("   ",data);
        var deferred = Q.defer();
        sql = this.setPrefix(sql);
        this.cop().then( function(connection) {
            sql = PDOX.substituteFields(connection, sql, data);
            connection.query(sql, data, function(err, result) {
                if (err) {
                    console.log('Could not execute query');
                    console.log(sql);
                    console.log(data);
                    connection.release();
                    let myerror = 'Could not execute query '+sql;
                    if ( dothrow )  throw myerror;
                    deferred.reject(myerror);
                } else {
                    // console.log('query die returning rows:', rows.length);
                    connection.release();
                    if ( returnval == 2 ) {
                        deferred.resolve(result.insertId);
                    } else if ( returnval == 1 ) {
                        deferred.resolve(result.changedRows);
                    } else {
                        deferred.resolve(result.affectedRows);
                    }
                }
            });
        }).catch (function (connectionError) {
            deferred.reject (connectionError);
        });
        return deferred.promise;
    }
}

module.exports = PDOX;
