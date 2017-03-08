var express = require('express');
var moment = require('moment');
var google = require('googleapis');
var calendar = google.calendar('v3');
var fs = require('fs')
var morgan = require('morgan')
var bodyParser = require('body-parser');

var app = express();

var OAuth2 = google.auth.OAuth2;
var oauth2Client = oauth2Client = new OAuth2(
	process.env.CLIENT_ID,
	process.env.CLIENT_SECRET,
	process.env.REDIRECT_URL
);
var googleToken;

var HttpLogStream = fs.createWriteStream(__dirname + '/http.log', {flags: 'a'})

app.use(morgan('combined', {stream: HttpLogStream}))
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
			console.log('Error: ' + err);
			res.status(500).send('Error getting token.');
			return;
		}

		if(typeof(token.refresh_token) == 'undefined' && typeof(googleToken.refresh_token) != 'undefined') token.refresh_token = googleToken.refresh_token; /* When googel refreshes the token no refresh_token is provided */
		
		console.log('Received token: ', token);
		googleToken = token;
		
		fs.writeFile(__dirname + '/auth.json', JSON.stringify(googleToken), function (err,data) {
			if (err) {
				return console.log('File Error: ' + err);
			}
		});
		
		oauth2Client.setCredentials({
			access_token: googleToken.access_token,
			refresh_token: googleToken.refresh_token
		});
		
		res.status(200).send("Success!");
	});
});

app.post('/', function(req, res) {
	if ((req.body.command == '/hangout') && (typeof(req.body.user_name) != 'undefined')) {
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
					res.status(200).send(JSON.stringify({
							response_type: 'in_channel',
							text: '**' + req.body.user_name + ' invites to Hangout**\nClick <' + event.hangoutLink + '|here> to join!',
							username: 'Mattermost Hangout',
							icon_url: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Hangouts_Icon.png'
					}));
				} else {
					res.satus(500).send(err);
				}
			});
	} else {
		res.status(400).send('Invalid parameters');
	}
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log('Listening on ' + port);
	
	if(fs.existsSync(__dirname + '/auth.json')) {
		console.log('Require auth.json');
		googleToken = JSON.parse(fs.readFileSync(__dirname + '/auth.json', 'utf8'));
		if(typeof(googleToken) != 'undefined') {
			oauth2Client.setCredentials({
				access_token: googleToken.access_token,
				refresh_token: googleToken.refresh_token
			});
			console.log('Done!');
		} else {
			console.log('Something went wrong!');
		}
	} else {
		console.log('Cannot find auth.json');
	}
	
});