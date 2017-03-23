
var progress = (function($, config, actions) {
	var _progressBar = $('progress');
	var _statusLable = $('#status');
	
	var _defaultProgressPerStep = _progressBar.attr('max') / actions.length;
	var _progressCicleInterval = 0.01;
	
	function status(t) {
		_statusLable.text(t);
	}
	function updateProgress(p) {
		_progressBar.val(_progressBar.val() + p);
	}
	function setProgress(p) {
		_progressBar.val(p);
	};
	function getProgress() {
		return _progressBar.val();
	}
	
	function ajaxProcess(action, resolve, reject) {
		$.ajax({
			url: action.ajax.url,
			type: 'GET',
			success: function(data) {
				resolve(data.responseText);
			},
			error: function(data) {
				reject(data.responseText);
			}
		});
	}
	function process(action, success, error, always) {
		var proc;		
		switch(action.type) {
			case "ajax": proc = ajaxProcess; break;
		}
		return new Promise(function(resolve, reject) {
			proc(action, resolve, reject);
		}).then(function(data) {
			return data;
		}).then(function(data) {
			success(data);
		}).catch(function(data){
			error(data);
		}).then(function(){
			always();
		});
	}
	
	function initFakeProgress(action, i) {
		var estProg = (_defaultProgressPerStep / action.progress.estimatedTime) * _progressCicleInterval;
		var doneProg = _defaultProgressPerStep * (i + 1);
		status(action.status.start);
		
		_currentProgressInterval = setInterval(function() {
			updateProgress(estProg);
			if(getProgress() >= (doneProg)) clearInterval(_currentProgressInterval);
		}, _progressCicleInterval * 1000);
		return doneProg;
	}
	
	var _currentProgressInterval;
	var _currentStep = 0; 
	function next() {
		var action = actions[_currentStep];
		var doneProg = initFakeProgress(action, _currentStep);
		
		var success;
		process(action, function(result) {
			status((action.status.success == null ? result : action.status.success));
			setProgress(doneProg);
			success = (action.progress.done != null ? action.progress.done() : true);
		}, function(error) {
			status((action.status.error == null ? error : action.status.error));
			success = (action.progress.error != null ? action.progress.error() : false);
		}, function() {
			if(_currentProgressInterval != null) clearInterval(_currentProgressInterval);
			
			if(success) {
				if(_currentStep == (actions.length - 1)) {
					return;
				}
				_currentStep++;
				next();
			}
		});
	}
	
	function initContent(scope='#progress') {
		return $(scope).append('<div class="header"><lable for="status" class="status">Status</lable><span class="value">Loading Progress Logic</span></div><progress max="100" value="0"></progress>');
	}
	
	function startProgress() {
		next();
	}
	return {
		'status': function(t) {
			status(t);
		},
		'start': function() {
			startProgress();
		}
	};
});

progessV2 = (function($, globals) {
	return (function(actions, config) {
		var progress = function() {
			var _events = {
				progressDone: 0,
				progressAbout: 1,
				progressError: 2
			};
			var _callbacks;
			function _registerCallback(trigger, callback) {
				_callbacks[trigger] = callback;
			}
			function _runCallback(trigger, args) {
				if(typeof _callbacks[trigger] !== 'function') return false;
				_callback[trigger].apply(this, args);
				return true;
			}
			
			function _async(func) {
				window.setTimeout(func, 1); // "async"
			}
			
			/* Callbacks for Event System */
			this.done = function(callback) {
				_registerCallback(_events.progressDone, callback);
			}
			this.about = function(callback) {
				_registerCallback(_events.progressAbout, callback);
			}
			this.error = function(callback) {
				_registerCallback(_events.progressError, callback);
			}
			
			/* Start function */
			this.start = function() {
				// When the user calls this function, the progress should start imediatly.
				if(_currentAction !== 'undefined' || _currentAction != null) return; // Progress already started
				_async(next());
				return this;
			}
 			var _currentAction;
			function _next() {
				// This function handels the progress and starts new worked threads.
				if(typeof _currentAction === 'undefined' || _currentAction == null) _currentAction = 0; // When progress starts.
				
			}
			
			/* Initial function */
			function progress() {
				_runCallback(_events.progressError, ['NotImplementedYet']);
			}
			progress();
		};
		return new progress();
	});
})(jQuery, null);


var prg = progressV2({
	start: 'now',
	aboutable: true
}, [{
	'type': 'ajax',
	'ajax': {
		'url': 'check/auth'
	},
	'progress': {
		'estimatedTime': 10
	},
	'status': {
		'start': 'Creating Creditials...',
		'success': 'Passed!'
	}
}]).done(function() {
	alert('Done!');
}).about(function() {
	alert('Ok.');
}).error(function(err) {
	alert(err);
});

