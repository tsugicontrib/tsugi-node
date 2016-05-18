/**
 * Some static routines to handle connection chores.
 */
class Connection {

    /**
     * Test the connection
     * https://www.npmjs.com/package/mysql
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
     * https://www.npmjs.com/package/mysql
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
     * Test the connection
     * https://www.npmjs.com/package/mysql
     */
    static testTables(connection, dbprefix) {
        let sql = 'SELECT * FROM '+dbprefix+'lti_key';
        connection.query(sql, function(err, rows, fields) {
            if (err) {
                console.log('Could not load data query', sql);
                console.log('You need to install the Tsugi application console (a PHP app)');
                console.log('and use the Admin functionality to create the Tsugi tables');
                console.log('to initialize this application.');
                throw err;
            }
            console.log('Table test success');
        });
    }
}
    
module.exports = Connection;
