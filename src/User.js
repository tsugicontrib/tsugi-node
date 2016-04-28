
let Entity = require('./Entity');

/**
 * This captures all of the data associated with the LTI Launch.
 */

class User extends Entity {

    /**
     * @param {number} id
     */
    constructor(id) {
        super();
        /**
         * @type {number}
         */
        this.id = id;
        this.TABLE_NAME = "lti_user";
        this.PRIMARY_KEY = "user_id";
    }

}

module.exports = User;
