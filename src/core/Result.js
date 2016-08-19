
/**
* This captures all of the result data associated with the LTI Launch.
*/

class Result {

  /**
  * @param {number} id
  * @param {number} grade
  * @param {string} comment
  * @param {string} url
  * @param {string} sourcedId
  * @param {Service} service
  */
  constructor (id, grade, comment, url, sourcedId, service) {
    /**
    * @type {number}
    */
    this._id = id;
    this._grade = grade;
    this._comment = comment;
    this._url = url;
    this._sourcedId = sourcedId;
    this._service = service;
  }

  get id () { return this._id; }
  get grade () { return this._grade; }
  get comment () { return this._comment; }
  get url () { return this._url; }
  get sourcedId () { return this.sourcedId; }
  get service () { return this.service; }

  set id (id) { this._id = id; }
  set grade (grade) { this._title = grade; }
  set comment (comment) { this._comment = comment; }
  set url (url) { this._url = url;}
  set sourcedId (sourcedId) { this._sourcedId = sourcedId; }
  set service (service) { this._service = service; }
}

module.exports = Result;
