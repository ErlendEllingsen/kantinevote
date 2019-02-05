
module.exports = class Notifications {

  constructor(UserConfig) {
    this.UserConfig = UserConfig;
  }

  getSetting() {
    return (
      this.UserConfig.userCfg['notifications'] === true
    );
  }

  setSetting(state) {
    this.UserConfig.userCfg['notifications'] = state;
    this.UserConfig.save();
  }



};