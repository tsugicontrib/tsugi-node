
/**
* This captures all of the context data associated with the LTI Launch.
*/

class Context {

  /**
  * @param {number} id
  * @param {string} title
  * @param {Settings} settings
  */
  constructor (id, title, settings) {
    /**
    * @type {number}
    */
    this._id = id;
    this._title = title;
    this._settings = settings;
  }

  get id() { return this._id; }
  get title() { return this._title; }
  get settigns() { return this._settings; }

  set id(id) {this._id = id;}
  set title(title) {this._title = title;}
  set settings(settings) {this._settings = settings;}
}

module.exports = Context;
