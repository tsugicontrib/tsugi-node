class Settings {

    constructor (){
      this._settings;
    }

    get settings () { return this._settings; }
    set settings (settings) {this._settings = settings}

    getSetting (key) {
      return this._settings[key];
    }

    setSetting (key,value) {
      this._settings[key] = value;
    }

}

module.exports = Settings;
