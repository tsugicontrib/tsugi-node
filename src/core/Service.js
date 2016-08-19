
/**
* This captures all of the service data associated with the LTI Launch.
*/

class Service {

  /**
  * @param {number} id
  * @param {string} url
  */
  constructor (id, url) {
    /**
    * @type {number}
    */
    this._id = id;
    this._url = url;
  }

  get id() { return this._id; }
  get url() { return this._url; }

  set id(id) {this._id = id;}
  set url(url) {this._url = url;}
}

module.exports = Service;
