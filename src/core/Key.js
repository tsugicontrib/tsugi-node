
/**
* This captures all of the key data associated with the LTI Launch.
*/

class Key {

  /**
  * @param {number} id
  * @param {string} title
  */
  constructor (id, title) {
    /**
    * @type {number}
    */
    this._id = id;
    this._title = title;
  }

  get id() { return this._id; }
  get title() { return this._title; }

  set id(id) {this._id = id;}
  set title(title) {this._title = title;}
}

module.exports = Key;
