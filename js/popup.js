$( document ).ready(function() {
	chrome.storage.sync.get({
		school: ''
	}, function(items) {
		if (items.school === '') {
			$('#schoolAlert').removeClass('hidden');
		}
	});

	$("a").click(function() {
		chrome.runtime.sendMessage({buttonPressed: this.id});
	});
});
