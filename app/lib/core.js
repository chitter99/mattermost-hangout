module.exports.error = function(res, message='Unexpected Error Occured!', help) {
	if(typeof help !== 'undefined' || help == null) help = module.exports.getInformationForError(message);
	res.status(500).render('error', {
		error_message: message,
		error_help: help
	});
	console.log('Error Occured: ' + message);
}
module.exports.getInformationForError = function(error) {
	switch(error) {
		case 'test': return ['This is a Test Error', 'Ignore me!'];
		case 'invalid_grant': return ['Retry Authentication with your Google Account']
		case 'no_auth': return ['Retry Authentication with your Google Account']
		case 'no_refresh_token': return ['Retry Authentication with your Google Account']
	}
}
module.exports.getURL = function() {
	return 'http://' + process.env.HOSTNAME + ':' + (process.env.PORT || 5000) + '/';
};