var moment = require('moment');
var google = require('googleapis');
var calendar = google.calendar('v3');
var fs = require('fs')

module.exports = (function() {
	var authPath = __dirname + '/../../auth.json';
	var oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);
	
	loadAuth = function() {
		if(!oauth2Client.access_token && !oauth2Client.refresh_token) {
			if(fs.existsSync(authPath)) {
				console.log('Load auth.json');
				googleToken = JSON.parse(fs.readFileSync(authPath, 'utf8'));
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
	}
	
	generateAuthUrl = function() {
		return oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: 'https://www.googleapis.com/auth/calendar'
		});
	}
	
	getToken = function(code, callback) {
		oauth2Client.getToken(code, function(err, token) {
			if (err) {
				return callback((err.toString()).replace('Error: ', ''), null);
			}

			console.log('Received token: ', token);
			
			if(typeof token.refresh_token === 'undefined') {
				/* Token is refreshed by google */
				if(typeof googleToken === 'undefined')
				{
					loadAuth();
					if(typeof googleToken === 'undefined')
					{
						console.log('Google Error: Google trying to refresh token but we do not have an access token!');
						return callback('no_auth', null);
					}
				}
				if(typeof googleToken.refresh_token === 'undefined') 
				{
					return callback('no_refresh_token', null);
				}
				token.refresh_token = googleToken.refresh_token;
			}		
			googleToken = token;
			
			fs.writeFile(authPath, JSON.stringify(googleToken), function (err, data) {
				if (err)
				{
					console.log('File Error!');
					return callback((err.toString()).replace('Error: ', ''), null);
				}
			});
			
			oauth2Client.setCredentials({
				access_token: googleToken.access_token,
				refresh_token: googleToken.refresh_token
			});
			return callback(null, token);
		});
	}
	
	createHangoutMeeting = function(user_name, callback) {
		var now = moment().format();
		loadAuth();
		calendar.events.insert({
			calendarId: 'primary',
			resource: {
				summary: user_name + '\'s hangout',
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
			if(err != null || event == null) {
				return callback((err.toString()).replace('Error: ', ''), null);
			}
			return callback(null, event);
		});
	}
	
	return {
		getToken: function(code, callback) {
			return getToken(code, callback);
		},
		generateAuthUrl: function() {
			return generateAuthUrl();
		},
		createHangoutMeeting: function(user_name, callback) {
			return createHangoutMeeting(user_name, callback);
		},
		isAuth: function() {
			if(fs.existsSync(authPath)) {
				return true;
			}
			return false;
		}
	};
})();
