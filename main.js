'use strict';

const videoElement = document.querySelector('video');
const audioInputSelect = document.querySelector('select#audioSource');
const videoSelect = document.querySelector('select#videoSource');
const resolutionSelect = document.querySelector("select#resolution");
const selectors = [audioInputSelect, videoSelect];

function gotDevices(deviceInfos) {
    // Handles being called several times to update labels. Preserve values.
    const values = selectors.map(select => select.value);
    selectors.forEach(select => {
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
    });
    for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
            audioInputSelect.appendChild(option);
        } else if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        } else {
            console.log('Some other kind of source/device: ', deviceInfo);
        }
    }
    selectors.forEach((select, selectorIndex) => {
        if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
            select.value = values[selectorIndex];
        }
    });
}

function gotStream(stream) {
    window.stream = stream; // make stream available to console
    videoElement.srcObject = stream;
    // Refresh button list in case labels have become available
    return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
    console.log('navigator.MediaDevices.getUserMedia error: ', error);
}

function start() {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    const audioSource = audioInputSelect.value;
    const videoSource = videoSelect.value;
    const resolution = resolutionSelect.value.split('x');

    const constraints = {
        audio: {
            deviceId: audioSource ? {
                exact: audioSource
            } : undefined,
            echoCancellation: false,
            noiseSuppression: false,
            sampleRate: 48000
        },
        video: {
            deviceId: videoSource ? {
                exact: videoSource
            } : undefined,
            width: undefined,
            height: undefined,
            aspectRatio: undefined
        }
    };

    if(constraints.video.deviceId) {
        constraints.video.width = { min: parseInt(resolution[0]) };
        constraints.video.height = { min: parseInt(resolution[1]) };
        constraints.video.aspectRatio = { ideal: 1.7777777778 };
    }

    navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}

function setupGainNode(stream, volume = 1) {
    // We assume only one audio track per stream
    const audioTrack = stream.getAudioTracks()[0]
    var ctx = new AudioContext()
    var src = ctx.createMediaStreamSource(new MediaStream([audioTrack]))
    var dst = ctx.createMediaStreamDestination()
    var gainNode = ctx.createGain()
    gainNode.gain.value = volume
    // Attach src -> gain -> dst
    ;
    [src, gainNode, dst].reduce((a, b) => a && a.connect(b))
    stream.removeTrack(audioTrack)
    stream.addTrack(dst.stream.getAudioTracks()[0])
}

document.querySelector('#volume-up').addEventListener('click', () => setupGainNode(window.stream, 1.5));
document.querySelector('#volume-down').addEventListener('click', () => setupGainNode(window.stream, 0.5));
document.querySelector('#toggle-screen').addEventListener('click', () => {
    let container = document.querySelector('#container');
    let containerSub = container.querySelector('div');
    if (containerSub.classList.contains('width-extended')) {
        containerSub.classList.remove('width-extended');
        containerSub.classList.remove('center');
        containerSub.classList.add('width-default');
        container.classList.remove('background');
        container.classList.add('row');
    } else {
        containerSub.classList.remove('width-default');
        containerSub.classList.add('width-extended');
        containerSub.classList.add('center');
        container.classList.add('background');
        container.classList.remove('row');
    }
});

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
audioInputSelect.onchange = start;
videoSelect.onchange = start;
resolutionSelect.onchange = start;

start();