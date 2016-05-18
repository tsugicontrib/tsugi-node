/**
 * Some static routines to handle connection chores.
 */
class Connection {

    /**
     * Test the connection
     * https://www.npmjs.com/package/mysql
     */
    static testConnection(connection) {
console.log("connection",connection);
        connection.connect();
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
console.log("after",connection);
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
}
    
module.exports = Connection;
