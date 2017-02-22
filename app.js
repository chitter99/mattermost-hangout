var express = require('express');
var moment = require('moment');
var google = require('googleapis');
var calendar = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;

var bodyParser = require('body-parser');
var app = express();

var oauth2Client = oauth2Client = new OAuth2(
	process.env.CLIENT_ID,
	process.env.CLIENT_SECRET,
	process.env.REDIRECT_URL
);
var googleToken = process.env.GOOGLE_TOKEN;

app.use(bodyParser.urlencoded());

app.get('/auth', function(req, res) {
	var url = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: 'https://www.googleapis.com/auth/calendar'
	});
	res.redirect(url);
});

app.get('/oauth2callback', function(req, res) {
	oauth2Client.getToken(req.query["code"], function(err, token) {
		if (err) {
			console.log("Error: " + err);
			res.send(500, "Error getting token.");
			return;
		}

		console.log('Received token: ', token);

		if (typeof(token.refresh_token) != 'undefined') {
			oauth2Client.credentials = {
				access_token: token.access_token,
				refresh_token: token.refresh_token,
				token_type: 'Bearer'
			};
			oauth2Client.refreshAccessToken(function(err, tokens) {
				if (!err) {
					console.log('Error: ', err);
					res.send(500, err);
				} else {
					console.log('Refreshed tokens: ', tokens);
					res.send(tokens);
				}
			});
		} else {
			res.send(token);
		}
	});
});

app.post('/', function(req, res) {
	console.log(req.body);
	if ((req.body.command == '/hangout') && (typeof(req.body.user_name) != 'undefined')) {
		oauth2Client.credentials = {
			access_token: googleToken,
			token_type: 'Bearer'
		};
		var now = moment().format();
		
		calendar
			.events
			.insert({
				calendarId: 'primary',
				resource: {
					summary: req.body.user_name + '\'s hangout',
					description: 'Hangout started from Mattermost',
					reminders: {
						overrides: {
							method: 'popup',
							minutes: 0
						}
					},
					start: {
						dateTime: now
					},
					end: {
						dateTime: now
					},
					attendees: []
				},
				auth: oauth2Client
			}, function(err, event) {
				if (event != null) {
					res.send(200, JSON.stringify({
							response_type: 'in_channel',
							text: '**' + req.body.user_name + ' invites to Hangout**\nClick <' + event.hangoutLink + '|here> to join!',
							username: 'Mattermost Hangout',
							icon_url: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Hangouts_Icon.png'
					}));
				} else {
					res.send(500, err);
				}
			});
	} else {
		res.send(400, 'Invalid parameters');
	}
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log('Listening on ' + port);
});