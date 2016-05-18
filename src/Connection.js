/**
 * Some static routines to handle connection chores.
 * https://www.npmjs.com/package/mysql
 */
class Connection {

    /**
     * Make the PDO-style format substitutions work
     *
     * https://www.npmjs.com/package/mysql#preparing-queries
     *
     *     connection.query("UPDATE posts SET title = :title", 
     *         { title: "Hello MySQL" });
     */
    static setupFormat(connection) {
        connection.config.queryFormat = function (query, values) {
            if (!values) return query;
            return query.replace(/\:(\w+)/g, function (txt, key) {
                if (values.hasOwnProperty(key)) {
console.log("BINDING ",key,txt,values[key]);
                    return this.escape(values[key]);
                }
                return txt;
            }.bind(this));
        };
    }

    /**
     * Test the connection
     */
    static testConnection(connection) {
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
    static testPool(pool) {
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
    static testTables(connection, dbprefix) {
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
}
    
module.exports = Connection;
