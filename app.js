const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const log = require('./app/lib/log.js');

const app = express();

app.engine('handlebars', exphbs({
	defaultLayout: 'layout',
	layoutsDir: __dirname + '/app/views/layout'
}));

app.set('view engine', 'handlebars');
app.set('views', __dirname + '/app/views');

app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/app/public'));

require(__dirname + '/app/routes')(app);

log.debug("Auth.js is located at " + require('./app/lib/config.js').getAuthPath());

const port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	log.info('Listening on ' + port);
});
