module.exports = (function() {	
	this.info = function(message) {
		console.log("[" + (new Date()).toUTCString() + "][info] " + message);
	}
	this.debug = function(message) {
		console.log("[" + (new Date()).toUTCString() + "][debug] " + message);
	}
	this.err = function(ex) {
		console.err("Error: " + ex);
	}
	return this;
})();
