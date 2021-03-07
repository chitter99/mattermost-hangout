module.exports = {
	info(message) {
		console.log("[" + (new Date()).toUTCString() + "][info] " + message);
	},
	debug(message) {
		console.log("[" + (new Date()).toUTCString() + "][debug] " + message);
	},
	err(ex) {
		console.err("Error: " + ex);
	},
}
