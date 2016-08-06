
var Q = require("q");

/**
 * Utilities to avoid repeating ourselves.
 */
class TsugiUtils {

    /*
     * Indicate whether we are in the midst of unit tests.
     *
     * This is controlled by a global variable:
     *
     *   var TSUGI_UNIT_TEST=true;
     *
     * @type {boolean}
     */
    static unitTesting()
    {
        return (typeof TSUGI_UNIT_TEST != 'undefined' && TSUGI_UNIT_TEST);
    }

    /**
     * Copy a property from one list to another
     */
    static copy(to, to_key, from, from_key=null, from_key_2=null)
    {
        if ( to_key == null) return;
        if ( from_key == null ) from_key = to_key;
        let value = from[from_key];
        if ( value == null && from_key_2 != null) {
            value = from[from_key_2];
        }
        if ( value == null ) {
            delete to[to_key];
        } else {
            to[to_key] = value;
        }
    }

    // See Also: http://rich.k3r.me/blog/2015/04/29/empty-promises-dos-and-donts-of-es6-promises/
    /**
      * Generate an empty Promise NodeJS style
      *
      * @param {mixed} val - The value to resolve with
      */
    static emptyPromise(val=null)
    {
        var deferred = Q.defer();
        deferred.resolve(val);
        return deferred.promise;
    }

    /**
      * Generate an empty Promise NodeJS style
      *
      * @param {mixed} val - The value to reject with
      */
    static emptyPromiseFail(val=null)
    {
        var deferred = Q.defer();
        deferred.reject(val);
        return deferred.promise;
    }

    /**
     * Mimic the PHP isset
     */
    static isset(v) {
        if ( typeof v == 'undefined') return false;
        if ( v === null ) return false;
        return true;
    }

    /**
     * Reduce non real values to null
     */
    static toNull(v) {
        if ( typeof v == 'undefined') return null;
        if ( v === null || v === false ) return null;
        return v;
    }

    /**
     * Reduce non real values to null for an object
     *
     * @param {object} v
     */
    static toNullAll(row) {
        for ( let key in row ) {
            row[key] = this.toNull(row[key]);
        }
    }

    /**
     * Get the full url for the request
     *
     * @param {dsdsljk} req The http request object
     */
    // http://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
    static requestUrl(req) {
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        return fullUrl;
    }

}

module.exports = TsugiUtils;
