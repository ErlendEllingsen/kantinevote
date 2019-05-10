module.exports = function(callback) {
    require('child_process').exec('./cursor-position.sh', function(error, stdout, stderr) {
      callback(error, JSON.parse(stdout));
    });
  }