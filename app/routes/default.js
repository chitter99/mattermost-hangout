var config = require('../lib/config.js');
module.exports = function(app){
	app.get('/', function(req, res){
		res.render('index');
	});
	app.get('/github', function(req, res){
		res.redirect(config.values.github);
	});
	app.get('/github/issues', function(req, res){
		res.redirect(config.values.github + 'issues');
	});
}