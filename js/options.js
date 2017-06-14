$(document).ready(function() {
	chrome.storage.sync.get({
		school: ''
	}, function(items) {
		$('#school').val(items.school);
	});

	$('#save').click(function() {
		chrome.storage.sync.set({
			school: $('#school').val()
		});
	});
});
