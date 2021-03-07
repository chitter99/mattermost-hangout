const google = require('../lib/google.js');
const core = require('../lib/core.js');

module.exports = function(app){
	app.get('/check', function(req, res){
		res.render('check');
	});
	app.get('/check/configuration', function(req, res){
		if(typeof process.env.CLIENT_ID !== 'undefined' && typeof process.env.CLIENT_SECRET !== 'undefined' && typeof process.env.REDIRECT_URL !== 'undefined') {
			if(typeof process.env.HOSTNAME === 'undefined') {
				res.status(200).send('Hostname is not set'); // Warning
				return;
			}
			res.status(200).send(); return;
		}
		res.status(500).send('Required Parameter is missing');
	});
	app.get('/check/auth', function(req, res){
		if(google.isAuth()) {
			res.status(200).send();
		} else {
			res.status(500).send('Cannot find auth.json');
		}
	});
	app.get('/check/meeting', function(req, res){
		google.createHangoutMeeting('test', function(err, event) {
			if(err != null) {
				res.status(500).send(err); return;
			}			
			res.status(200).send();
		});
	});
}