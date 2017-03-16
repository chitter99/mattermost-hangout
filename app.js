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

if(!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REDIRECT_URL) {
	console.log('Required parameter not given!');
	process.exit(1)
}

var HttpLogStream = fs.createWriteStream(__dirname + '/http.log', {flags: 'a'})

function loadAuth()
{
	if(fs.existsSync(__dirname + '/auth.json')) {
		console.log('Load auth.json');
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
}

function responseMessage(message, type='in_channel')
{
	return JSON.stringify({
			response_type: type,
			text: message,
			username: 'Mattermost Hangout',
			icon_url: GetURL() + 'icon.png'
	});
}

function GetURL()
{
	return 'http://' + process.env.EXTERNAL_IP + ':' + port + '/';
}

app.use(morgan('combined', {stream: HttpLogStream}))
app.use(bodyParser.urlencoded());

app.use(express.static(__dirname + '/view'));
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
	res.sendFile('index.html');
});

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

		console.log('Received token: ', token);
		
		if(typeof token.refresh_token === 'undefined') {
			/* Token is refreshed by google */
			if(typeof googleToken === 'undefined')
			{
				loadAuth();
				if(typeof googleToken === 'undefined')
				{
					console.log('Error: Google trying to refresh token but we do not have an access token!');
					res.status(500).send("No access token!"); 
					return;
				}
			}
			if(typeof googleToken.refresh_token === 'undefined') 
			{
				console.log('Error: No refresh token!');
				res.status(500).send("No refresh token!"); 
				return;
			}
			token.refresh_token = googleToken.refresh_token;
		}		
		googleToken = token;
		
		fs.writeFile(__dirname + '/auth.json', JSON.stringify(googleToken), function (err,data) {
			if (err)
			{
				return console.log('File Error: ' + err);
			}
		});
		
		oauth2Client.setCredentials({
			access_token: googleToken.access_token,
			refresh_token: googleToken.refresh_token
		});
		res.sendFile(__dirname + '/view/success.html');
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
					
					var message = '**{user} invites to Hangout**\nClick <{link}|here> to join!';
					
					message = message.replace('{user}', req.body.user);
					message = message.replace('{link}', event.hangoutLink);
					
					res.status(200).send(responseMessage(message));
				} else {
					console.log(err);
					res.satus(200).send(responseMessage('An error occured!\n``' + err + '``', 'ephemeral'));
				}
			});
	} else {
		res.status(400).send('Invalid parameters');
	}
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log('Listening on ' + port);
	loadAuth();
});