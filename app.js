var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');

var app = express();

app.engine('handlebars', exphbs({
	defaultLayout: 'layout',
	layoutsDir: __dirname + '/app/views/layout'
}));

app.set('view engine', 'handlebars');
app.set('views', __dirname + '/app/views');

app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/app/public'));

require(__dirname + '/app/routes')(app);

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log('Listening on ' + port);
});
