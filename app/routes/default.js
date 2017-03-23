module.exports = function(app){
	var github = 'https://github.com/chitter99/mattermost-hangout/';
	app.get('/', function(req, res){
		res.render('index');
	});
	app.get('/github', function(req, res){
		res.redirect(github);
	});
	app.get('/github/issues', function(req, res){
		res.redirect(github + 'issues');
	});
	app.get('/test', function(req, res) {
		core.error('test');
	});
}