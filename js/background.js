function startScreenRecording() {
    var recordedChunks = [];
    var mediaRecorder;

    function handleDataAvailable(event) {
        recordedChunks.push(event.data);
    }

    function handleMediaRecorderStop() {
        var blob = new Blob(recordedChunks, {
            type: 'video/webm'
        });
        recordedChunks = [];
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = url;
        a.download = 'recording.webm';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    function stopRecording() {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(function(track) {
            track.stop();
        });
    };

    function handleStream(stream) {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleMediaRecorderStop;
        mediaRecorder.stream.getTracks().forEach(function(track) {
            track.onended = function() {
            	stopRecording();
            };
        });
        mediaRecorder.start();
    };

    function handleStreamError(error) {
    	console.log(error);
    }

    function handleGetDesktopCapture(streamID, options) {
        var getUserMediaOptions = {
            audio: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamID
              }
            },
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamID,
                maxWidth: window.screen.width,
                maxHeight: window.screen.height
              }
            }
        };
        if (!options.canRequestAudioTrack) {
            delete getUserMediaOptions.audio
        }
        navigator.webkitGetUserMedia(getUserMediaOptions, handleStream, handleStreamError);
    }

	chrome.desktopCapture.chooseDesktopMedia(["screen", "audio"], handleGetDesktopCapture);
}

function takeScreenshot() {
	var video = document.createElement("video");
	var canvas = document.createElement("canvas");
	var photo = document.createElement("img");
	var width = window.screen.width;
	var height = window.screen.height;

	function handleGetDesktopCapture(streamId, options) {
		var getUserMediaOptions = {
		    audio: {
		      mandatory: {
		        chromeMediaSource: 'desktop',
		        chromeMediaSourceId: streamId
		      }
		    },
		    video: {
		      mandatory: {
		        chromeMediaSource: 'desktop',
		        chromeMediaSourceId: streamId,
		        maxWidth: window.screen.width,
		        maxHeight: window.screen.height
		      }
		    }
		};
		if (!options.canRequestAudioTrack) {
		    delete getUserMediaOptions.audio
		}
		navigator.webkitGetUserMedia(getUserMediaOptions, handleStream, handleStreamError);
	}

	function handleStream(stream) {
		video.srcObject = stream;
		video.play();
	}

	function handleStreamError(err) {
		console.log(err);
	}

	video.addEventListener('canplay', function(ev){
		var delay = Date.now() + 1000;
		chrome.alarms.create('takeScreenshot', {when: delay});
	});

	chrome.alarms.onAlarm.addListener(function (alarm) {
		if (alarm.name === 'takeScreenshot') {
			video.setAttribute('width', width);
			video.setAttribute('height', height);
			canvas.setAttribute('width', width);
			canvas.setAttribute('height', height);
		    var context = canvas.getContext('2d');
		    if (width && height) {
		    	canvas.width = width;
		    	canvas.height = height;
		    	context.drawImage(video, 0, 0, width, height);

				video.srcObject.getTracks().forEach(function(track) {
		        	track.stop();
		    	});

				var url = canvas.toDataURL('image/png');
		        var a = document.createElement('a');
		        document.body.appendChild(a);
		        a.style = 'display: none';
		        a.href = url;
		        a.download = 'screenshot.png';
		        a.click();
		        window.URL.revokeObjectURL(url);
		    }
		}
	});

	chrome.desktopCapture.chooseDesktopMedia(["screen"], handleGetDesktopCapture);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	if (request.buttonPressed) {
		if (request.buttonPressed === 'helpDesk') {
			chrome.storage.sync.get({
				school: ''
			}, function(items) {
				chrome.tabs.create({url: 'http://helpdesk/portal' + items.school});
			});
		}

		if (request.buttonPressed === 'options') {
			chrome.runtime.openOptionsPage();
		}

		if (request.buttonPressed === 'takeScreenshot') {
			takeScreenshot();
		}

		if (request.buttonPressed === 'startScreenRecording') {
			startScreenRecording();
		}
	}

});
