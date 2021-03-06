var fs = require('fs');
var colors = require('colors');
var utils = require('../utils');

exports =
module.exports = logout;

module.exports.usage =
function usage(name, args) {
  args.
    usage('crowdprocess ' + name + ' <username> <password>');
};

function logout(args) {
  var cpDir = utils.getUserHome() + '/.crowdprocess';
  var confPath = cpDir + '/' + '/auth_token.json';
  if (fs.existsSync(confPath)) {
    fs.unlinkSync(confPath);
    console.log('Logged out successfully'.green);
  } else {
    console.log('Already logged out');
  }

}