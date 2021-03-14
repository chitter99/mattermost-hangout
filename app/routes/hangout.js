const core = require('../lib/core.js');
const google = require('../lib/google.js');
const mattermost = require('../lib/mattermost.js');
const log = require('../lib/log.js');

module.exports = function(app){
	app.post('/', function(req, res){
		if(!req.body.user_name) {
			return core.error(res, 'Parameter user_name is missing!');
		}
		if ((process.env.MM_VERIFY_TOKEN && req.body.token) && process.env.MM_VERIFY_TOKEN !== req.body.token) {
			console.log('incoming token', req.body.token, 'doesn\'t match provided env var MM_VERIFY_TOKEN');
			res.status(401).send(JSON.stringify({ error: 'invalid auth token' }));
			return;
		}
		const createMeetingPayload = {
			user_name: req.body.user_name,
			title: req.body.text,
			trigger_id: req.body.trigger_id,
		}
		google.createHangoutMeeting(createMeetingPayload, function(err, event) {
			res.setHeader('Content-Type', 'application/json');
			if(err) {
				res.status(200).send(mattermost.responseMessage('An error occured!\n``' + err + '``', 'ephemeral'));
			}

			let message = (process.env.MESSAGE || '**{user} invites to Hangout "{summary}"**\nClick <{link}|here> to join!');
			message = message.replace('{user}', req.body.user_name);
			message = message.replace('{link}', event.hangoutLink);
			message = message.replace('{summary}', event.summary);

			log.info("Created Call for user "+req.body.user_name+" at "+event.hangoutLink+"!");
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
			log.info("Successfully linked Google Account!");
			return res.render('success');
		});
	});
}
