$(document).ready(function() {
	check();
});

function check() {
	$('#checks').html('<li>Check started.</li>');
	
	$('#checks').append('<li>Configuration check... </li>');
	$.ajax({
		url: 'check/configuration',
		type: 'GET',
		success: function(data) {
			if(data) {
				$('#checks li').last().append('<a style="color: DarkOrange;">warning</a>');
				$('#checks').append('<li style="margin-left: 2em;">' + data + '</li>');
			} else {
				$('#checks li').last().append('<a style="color: green;">passed</a>');
			}
			$('#checks').append('<li>Auth check... </li>');
			$.ajax({
				url: 'check/auth',
				type: 'GET',
				success: function(data) {
					$('#checks li').last().append('<a style="color: green;">passed</a>');
					$('#checks').append('<li>Creating a Meeting... </li>');
					$.ajax({
						url: 'check/meeting',
						type: 'GET',
						success: function(data) {
							$('#checks li').last().append('<a style="color: green;">passed</a>');
							$('#checks').append('<li>Every thing passed!</li>');
						},
						error: function(data) {
							$('#checks li').last().append('<a style="color: red;">failed</a>');
							$('#checks').append('<li style="margin-left: 2em;">' + data + '</li>');
						}
					});
				},
				error: function(data) {
					$('#checks li').last().append('<a style="color: red;">failed</a>');
					$('#checks').append('<li style="margin-left: 2em;">' + data + '</li>');
				}
			});
		},
		error: function(data) {
			$('#checks li').last().append('<a style="color: red;">failed</a>');
			$('#checks').append('<li style="margin-left: 2em;">' + data + '</li>');
		}
	});
}