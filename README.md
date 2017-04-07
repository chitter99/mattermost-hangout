# Mattermost plugin for integrating hangouts

**The Concept is from [this](https://github.com/suda/slack-hangout) repository.**

## Introduction

This Application allows you to create a Hangout Call via a Command.

![Screenshot of Application](screenshots/screenshot1.jpg)

## Installation / Configuration

You can ether use docker or just nodejs. However we recomend using docker to install and use this application.
First of all you need to get your client id and client secret from google. How you do this is specified below.
To use this application you ether need a valid domain and a server connected to this domain. If you dont have something like that you can use [Heroku](http://www.heroku.com). 

### Get Client ID and Secret from google console

1. Go to Google Developers Console
2. Create Project
3. In APIs & auth select APIs and set Calendar API to ON
4. In APIs & auth select Credentials and click Create new Client ID
  * Set Application Type to Web application
  * Set Authorized JavaScript Origins to your hangout plugin url
  * Set Authorized Redirect URI to your Server URL with /oauth2callback suffix (i.e. http://mydomain.com:5000/oauth2callback)
  * Click Create Client ID

### Docker

You can use docker-compose to run this application with docker.

1. Clone docker repository from [here](https://github.com/chitter99/mattermost-hangout-docker)
2. Add this into your docker-compose.yml
 ```
 hangout:
  build: hangout
  ports:
    - "5000:5000"
  restart: always
  environment:
    - CLIENT_ID=<client_id>
    - CLIENT_SECRET=<client_secret>
    - REDIRECT_URL=<redirect_url>
    - HOSTNAME=<your_external_or_local_ip>
    - PORT=5000
 ```
3. Run ``docker-compose build hangout``
4. Run ``docker-compose up -d hangout``
5. Follow Step 6 from the NodeJS Instructions.
 
### NodeJS

1. Install NodeJS and NPM, just follow the instructions provided [here](https://howtonode.org/how-to-install-nodejs). 
2. Download this repository or clone it with git:
```
git init
git clone https://github.com/chitter99/mattermost-hangout.git
```

3. Install dependencies. To install all dependencies you can use the following command. Ensure you are in the directory where you downloaded this repository and you have installed npm.
```
npm install
```
 * After that you need to install one additional package with the following command:
```
npm install dotenv
```

4. CCreate a file called ".env" (without the quotes) and enter the following.
```
CLIENT_ID=
CLIENT_SECRET=
REDIRECT_URL=
HOSTNAME=localhost
PORT=5000
```
 * You now need to add your client id, client secret and redirect url from google. If you want to you can enter a new port (the port must be the same on your redirect url. So if you change him here, change him also in your google console). 
 * You will need to enter your external Ip Address, Domain or local Ip to enable support for a Bot icon. For example I'm running this Application on a Server in our Network, avariable under the local Ip Adress 192.168.1.10. I would enter this Ip Adress.
 
5. To run this application only the following command is required.
```
npm -r dotenv/config start
```
 * If you want to you can put this in a batch, shell or bash file depending on your platform.

6. Link with Google Account The last thing you will need to do is link your Application with an Google Account.
 * To do this open you Webbrowser and visit `http://<your-ip-or-domain>:5000/auth` and login with an Google Account.
 * I recomend creating an extra Google Account, because all meetings will be scheduled as this User.
  * When creating a new Google Account, open Google Calendar Settings and change `Automatically add video calls to events I create` to `true` on order to ensure this Application works. You can find this setting [here](https://calendar.google.com/calendar/render#settings-general_11).

## Integration into Mattermost

To Enable using this command go to your Mattermost instance, select a Team and press on the three dots right to your username.
Choose Integrations then Slash Commands and add a new Command. Set Request Methode to POST and fill the rest of the Data according to your Settup, press Save. Test the Integration by entering /hangout into any channel or private group you want.

## Customize Message

You can change the Message this Plugin sends to all users via your .env file or a parameter. The Variable `MESSAGE` is responsible for that. You can use the following values which will be replaced before sending the Message to Mattermost.

`{user}`: Will be replaced with the sender's Username.
`{link}`: Will be replaced with the link to the Mattermost Meeting.

An example is defined below.
```
{user} invites you to <{link}|join> Hangout!
```






