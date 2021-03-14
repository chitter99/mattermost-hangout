const core = require('./core.js');

module.exports.responseMessage = function(message, type= 'in_channel') {
	return JSON.stringify({
		response_type: type,
		text: message,
		username: 'Mattermost Hangout',
		icon_url: core.getURL() + 'icon.png', // todo: add an option to set icon url in config
	});
};
