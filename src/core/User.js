
/**
 * This captures all of the user data associated with the LTI Launch.
 */

class User{

    /**
     * @param {number} id
     * @param {string} email
     * @param {string} displayname
     * @param {number} role
     * @param {boolean} mentor
     */
    constructor(id, email, displayname, role) {
        /**
         * @type {number}
         */
        this._id = id;
        /**
         * @type {string}
         */
        this._email = email;
        /**
         * @type {string}
         */
        this._displayname = displayname;
        this._role = role;
        this._mentor = false;
    }

    get id () { return this._id; }
    get email () { return this._email; }
    get displayname () { return this._displayname; }
    get role () { return this._role; }
    get mentor () { return this._mentor; }

    /*
      LEARNER_ROLE = 0;
      INSTRUCTOR_ROLE = 1000;
      TENANT_ADMIN_ROLE = 5000;
      ROOT_ADMIN_ROLE = 10000;
    */
    get instructor () {return this._role >= 1000; }
    get tenantAdmin () {return this._role >= 5000; }
    get rootAdmin () { return this._role >= 10000; }

    set id (id) { this._id = id; }
    set email (email) { this._email = email; }
    set displayname (displayname) { this._displayname = displayname; }
    set role (role) { this._role = role; }
    set mentor (mentor) { this._mentor = mentor }

}

module.exports = User;
