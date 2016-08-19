
/**
* This captures all of the link data associated with the LTI Launch.
*/

class Link {

  /**
  * @param {number} id
  * @param {string} title
  * @param {Result} result
  * @param {Settings} settings
  */
  constructor (id, title, result, settings) {
    /**
    * @type {number}
    */
    this._id = id;
    this._title = title;
    this._result = result;
    this._settings = settings;
  }

  get id() { return this._id; }
  get title() { return this._title; }
  get result() { return this._result; }
  get settigns() { return this._settings; }

  set id(id) {this._id = id;}
  set title(title) {this._title = title;}
  set result(result) {this._result = result;}
  set settings(settings) {this._settings = settings;}
}

module.exports = Link;
