var core = require('../lib/core.js');
var google = require('../lib/google.js');
var mattermost = require('../lib/mattermost.js');

module.exports = function(app){
	app.post('/', function(req, res){
		if(!req.body.user_name) {
			return core.error(res, 'Parameter user_name is missing!');
		}
		google.createHangoutMeeting(req.body.user_name, function(err, event) {
			if(err) {
				res.status(200).send(mattermost.responseMessage('An error occured!\n``' + err + '``', 'ephemeral'));
			}
			
			var message = (process.env.MESSAGE || '**{user} invites to Hangout**\nClick <{link}|here> to join!');
			message = message.replace('{user}', req.body.user_name);
			message = message.replace('{link}', event.hangoutLink);
			
			res.status(200).send(mattermost.responseMessage(message));
		});
	});
	app.get('/auth', function(req, res){
		res.redirect(google.generateAuthUrl());
	});
	app.get('/oauth2callback', function(req, res){
		google.getToken(req.query['code'], function(err, token) {
			if(err != null || !token) {
				return core.error(res, err);
			}
			return res.render('success');
		});
	});
}