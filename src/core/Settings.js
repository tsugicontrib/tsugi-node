TsugiUtils  = require ('../util/TsugiUtils');

class Settings {

    constructor (CFG, id, url, jsonText, which, sessionRow){
      this._settings ={};
      this._id = id;
      this._which = which;
      this._resource = TsugiUtils.trimToNull (url);
      this._sessionRow = sessionRow;
      this.CFG = CFG;

      if (TsugiUtils.trimToNull (jsonText) != null) {
        this._settings = JSON.parse (jsonText);
      }

    }

    get settings () { return this._settings; }
    set settings (settings) {
      this._settings = settings;
      return this._persistSettings();
    }

    getSetting (key) {
      return this._settings[key];
    }

    setSetting (key, value) {
      this._settings[key] = value;
      return this._persistSettings();
    }

    _persistSettings (){
       let sql = `UPDATE {p}lti_${this._which}
                    SET settings = :jsonText
                    WHERE ${this._which}_id = :id
                  `;
        let data = {
          id : this._id,
          jsonText: JSON.stringify (this._settings)
        };

        //Save settings in the session row
        if (TsugiUtils.isset(this._sessionRow)){
            this._sessionRow[this._which + '_settings'] = this._settings;
        }

        //TODO: SEND settings to the tool consumer service

        //Save the settings on Tsugi Database
        return this.CFG.pdox.query(sql, data).then( function() {
            console.log( `=== Updated settings ${data.id} value=${data.jsonText}`);
        });

    }

}

module.exports = Settings;
