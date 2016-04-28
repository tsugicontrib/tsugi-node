
/**
 * This captures all of the data associated with the LTI Launch.
 */

class Entity {

    /**
     * All extending classes must define these member variables in their constructor
     */
    constructor() {
        /**
         * Implementing classes must override this variable in their constructor
         */
        this.TABLE_NAME = null; // "lti_result";
        /**
         * Implementing classes must override this variable in their constructor
         */
        this.PRIMARY_KEY = null; // "result_id";
        /**
         * Implementing classes must override this variable in their constructor
         */
        this.id = null;
    }

    /**
     * Load the json field for this entity
     *
     * @return {string} This returns the json string - it is not parsed - if there is 
     * nothing to return - this returns "false"
     */
    get json()
    {
        return null; /*
        global $CFG, $PDOX;

        $row = $PDOX->rowDie("SELECT json FROM {$CFG->dbprefix}{$this->TABLE_NAME} 
                WHERE $this->PRIMARY_KEY = :PK",
            array(":PK" => $this->id));
        if ( $row === false ) return false;
        $json = $row['json'];
        if ( $json === null ) return false;
        return $json; */
    }

    /**
     * Set the JSON entry for this entity
     *
     * @param {string} json This is a string - no validation is done
     *
     */
    set json(json)
    {
        /*
        global $CFG, $PDOX;

        $q = $PDOX->queryDie("UPDATE {$CFG->dbprefix}{$this->TABLE_NAME}
                SET json = :SET WHERE $this->PRIMARY_KEY = :PK",
            array(":SET" => $json, ":PK" => $this->id)
        );
        */
    }

    /**
     * Set/update a JSON key for this entity
     *
     * @param {string} key The key to be inserted/updated in the JSON
     * @param {string} value The value to be inserted/updated in the JSON
     *
     */
    setJsonKey(key,value)
    {
        /*
        global $CFG, $PDOX;

        $old = $this->getJson();
        $old_json = json_decode($old);
        if ( $old_json == null ) $old_json = new \stdClass();
        $old_json->{$key} = $value;
        $new = json_encode($old_json);
        $this->setJson($new);
        */
    }

}

module.exports = Entity;
