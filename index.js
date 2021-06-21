document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.querySelector("video");
    const audioSelect = document.querySelector("select#audioSource");
    const videoSelect = document.querySelector("select#videoSource");
    const resolutionSelect = document.querySelector("select#resolution");

    navigator.mediaDevices
        .enumerateDevices()
        .then(gotDevices)
        .then(getStream)
        .catch(handleError);

    audioSelect.onchange = getStream;
    videoSelect.onchange = getStream;
    resolutionSelect.onchange = getStream;

    function gotDevices(deviceInfos) {
        for (let i = 0; i !== deviceInfos.length; ++i) {
            const deviceInfo = deviceInfos[i];
            const option = document.createElement("option");
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === "audioinput") {
                option.text = deviceInfo.label || "microphone " + (audioSelect.length + 1);
                audioSelect.appendChild(option);
            } else if (deviceInfo.kind === "videoinput") {
                option.text = deviceInfo.label || "camera " + (videoSelect.length + 1);
                videoSelect.appendChild(option);
            } else {
                console.log("Found another kind of device: ", deviceInfo);
            }
        }
    }

    function getStream() {
        if (window.stream) {
            window.stream.getTracks().forEach(function (track) {
                track.stop();
            });
        }

        let resolution = resolutionSelect.value.split('x');

        const constraints = {
            audio: {
                deviceId: {
                    exact: audioSelect.value // UiT1+b/Fe3lJd0djHyiNMghyHXW8kkb3G7/xq8/G5JU=
                },
                echoCancellation: false,
                noiseSuppression: false,
                sampleRate: 48000
            },
            video: {
                deviceId: {
                    exact: videoSelect.value
                },
                width: {
                    min: resolution[0]
                },
                height: {
                    min: resolution[1]
                }
            },
        };

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(gotStream)
            .catch(handleError);
    }

    function gotStream(stream) {
        window.stream = stream; // make stream available to console
        videoElement.srcObject = stream;
    }

    function handleError(error) {
        switch (error.name) {
            case 'OverconstrainedError': // Resolución mayor a la permitida
                break;
        }
        console.error("Error: ", error);
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

    document.querySelector('#fullscreen').addEventListener('click', () => {
        if (videoElement.requestFullscreen) {
            videoElement.requestFullscreen();
        } else if (videoElement.mozRequestFullScreen) {
            videoElement.mozRequestFullScreen();
        } else if (videoElement.webkitRequestFullscreen) {
            videoElement.webkitRequestFullscreen();
        } else if (videoElement.msRequestFullscreen) {
            videoElement.msRequestFullscreen();
        }
    });

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




    /*
    setTimeout(function() {
        var x, i, j, l, ll, selElmnt, a, b, c;
        /* Look for any elements with the class "custom-select": *
        x = document.getElementsByClassName("custom-select");
        l = x.length;
        for (i = 0; i < l; i++) {
            selElmnt = x[i].getElementsByTagName("select")[0];
            ll = selElmnt.length;
            /* For each element, create a new DIV that will act as the selected item: *
            a = document.createElement("DIV");
            a.setAttribute("class", "select-selected");
            a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
            x[i].appendChild(a);
            /* For each element, create a new DIV that will contain the option list: *
            b = document.createElement("DIV");
            b.setAttribute("class", "select-items select-hide");
            for (j = 1; j < ll; j++) {
                /* For each option in the original select element,
                create a new DIV that will act as an option item: *
                c = document.createElement("DIV");
                c.innerHTML = selElmnt.options[j].innerHTML;
                c.addEventListener("click", function (e) {
                    /* When an item is clicked, update the original select box,
                    and the selected item: *
                    var y, i, k, s, h, sl, yl;
                    s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                    sl = s.length;
                    h = this.parentNode.previousSibling;
                    for (i = 0; i < sl; i++) {
                        if (s.options[i].innerHTML == this.innerHTML) {
                            s.selectedIndex = i;
                            h.innerHTML = this.innerHTML;
                            y = this.parentNode.getElementsByClassName("same-as-selected");
                            yl = y.length;
                            for (k = 0; k < yl; k++) {
                                y[k].removeAttribute("class");
                            }
                            this.setAttribute("class", "same-as-selected");
                            break;
                        }
                    }
                    h.click();
                });
                b.appendChild(c);
            }
            x[i].appendChild(b);
            a.addEventListener("click", function (e) {
                /* When the select box is clicked, close any other select boxes,
                and open/close the current select box: *
                e.stopPropagation();
                closeAllSelect(this);
                this.nextSibling.classList.toggle("select-hide");
                this.classList.toggle("select-arrow-active");
            });
        }
    }, 500);
    */
});


function AudioSource(source) {
    function add() {
        //
    }

    function remove() {
        //
    }

    function mute() {
        //
    }

    return {
        source,
        add,
        remove,
        mute,
    };
}

function test() {
    const constraints_test = {
        video: false,
        audio: {
            sampleRate: 48000,
            deviceId: {
                exact: 'UiT1+b/Fe3lJd0djHyiNMghyHXW8kkb3G7/xq8/G5JU='
            }
        }
    }

    navigator.mediaDevices.getUserMedia(constraints_test)
        .then((source) => window.source = source)
        .catch((err) => console.log(err));
}



////////////////////////////






function closeAllSelect(elmnt) {
    /* A function that will close all select boxes in the document,
    except the current select box: */
    var x, y, i, xl, yl, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    xl = x.length;
    yl = y.length;
    for (i = 0; i < yl; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i)
        } else {
            y[i].classList.remove("select-arrow-active");
        }
    }
    for (i = 0; i < xl; i++) {
        if (arrNo.indexOf(i)) {
            x[i].classList.add("select-hide");
        }
    }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);