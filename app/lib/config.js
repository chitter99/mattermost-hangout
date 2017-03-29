var path = require('path');

module.exports.values = require(__dirname + '/../../config/config.json');
module.exports.getAuthPath = function() {
	return path.dirname(require.main.filename) + this.values.auth_path;
}