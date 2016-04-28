
let Entity = require('./Entity');

/**
 * This captures all of the data associated with the LTI Launch.
 */

class User extends Entity {

    constructor(v) {
        super();
        /**
         * @type {number}
         */
        this.id = v;
        this.TABLE_NAME = "lti_user";
        this.PRIMARY_KEY = "user_id";
    }

}

module.exports = User;
