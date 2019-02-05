const fs = require('fs');

module.exports = new (class UserConfig {
  
  constructor() {
    this.userCfg = undefined;
  }

  load() {
    this.userCfg = JSON.parse(fs.readFileSync('./user.json').toString());
  }

  save() {
    fs.writeFileSync('./user.json', JSON.stringify(this.userCfg))
  }
})();