
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

}

module.exports = TsugiUtils;

