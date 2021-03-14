const fs = require('fs')
const path = require('path');

const google = require('googleapis');
const calendar = google.calendar('v3');

const config = require('./config.js');

let googleToken

const CALENDAR_ID = 'primary'

module.exports = (function() {
	const authPath = config.getAuthPath();
	const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);

	function loadAuth() {
		if(!oauth2Client.access_token && !oauth2Client.refresh_token) {
			if(fs.existsSync(authPath)) {
				console.log('Load ' + authPath);
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
	
	function generateAuthUrl() {
		return oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: 'https://www.googleapis.com/auth/calendar'
		});
	}
	
	function getToken(code, callback) {
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

			const targetDir = path.dirname(authPath);
			if (!fs.existsSync(targetDir)) {
				console.log('config directory', targetDir, 'doesn\'t exist. creating it')
				fs.mkdirSync(targetDir, { recursive: true })
				console.log('created config directory', targetDir)
			}

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
	
	function createHangoutMeeting({ user_name, title, trigger_id }, callback) {
		const now = (new Date()).toISOString();
		loadAuth();

		const eventTitle = title || (user_name + '\'s meeting');
		calendar.events.insert({
			auth: oauth2Client,
			calendarId: CALENDAR_ID,
			conferenceDataVersion: 1,
			resource: {
				conferenceData: {
					createRequest: {
						conferenceSolutionKey: {
						//The conference solution type.
						// If a client encounters an unfamiliar or empty type, it should still be able to display the entry points. However, it should disallow modifications.
						//
						// The possible values are:
						//
						// "eventHangout" for Hangouts for consumers (http://hangouts.google.com)
						// "eventNamedHangout" for classic Hangouts for Google Workspace users (http://hangouts.google.com)
						// "hangoutsMeet" for Google Meet (http://meet.google.com)
						// "addOn" for 3P conference providers
							type: 'hangoutsMeet',
						},
						requestId: trigger_id || ('some-random-string_' + now)
					}
				},
				summary: eventTitle,
				description: config.values.calendar_description,
				reminders: {
					overrides: {
						method: 'popup',
						minutes: 0
					}
				},
				start: {
					dateTime: now,
				},
				end: {
					dateTime: now,
				},
				attendees: [],
			},
		}, function(err, event) {
			if(err != null || event == null) {
				return callback((err.toString()).replace('Error: ', ''), null);
			}
			if (process.env.AUTO_DELETE_EVENT) {
				calendar.events.delete({
					auth: oauth2Client,
					calendarId: CALENDAR_ID,
					eventId: event.id,
				}, function(err) {
					if (err) {
						console.error('could not delete calendar event!', err)
					}
				})
			}
			return callback(null, event);
		});
	}
	
	return {
		getToken(code, callback) {
			return getToken(code, callback);
		},
		generateAuthUrl() {
			return generateAuthUrl();
		},
		createHangoutMeeting(payload, callback) {
			return createHangoutMeeting(payload, callback);
		},
		isAuth() {
			return fs.existsSync(authPath);
		}
	};
})();
