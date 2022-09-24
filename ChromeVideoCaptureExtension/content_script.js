
console.log("Contentscript started. " + document.location);


const ffmpegOpts = {
    "streamToHLS(h264 NVENC)": [
                    '-y' , '-re', '-i', '-',
                    '-c:v', 'h264_nvenc', '-tune', 'll',
                    '-rc', 'cbr', '-b:v', '3M',
                    '-c:a', 'aac', '-ar', 44100, '-b:a', '64k', 
                    '-f', 'hls',
                    '-hls_time', 4 ,
                    '-hls_flags', 'delete_segments'],
    "saveToFileWebM": [
                    '-y' , '-re', '-i', '-',
                    '-c:v', 'copy',
                    '-c:a', 'copy',
                    '-f', 'webm']
}


let socket = io("ws://localhost:3000",{ transports: ["websocket"],
                                        autoConnect: false,
                                        reconnection: false });

let recorder;

let settings = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    sendResponse({status: 'ok'});
    console.log("Message received: " + message);
    if (message == "start")
    {
        startCapture();
    }else if (message == "stop")
    {
        stopCapture();
    }
    else if (typeof message === "object" && message !== null)
    {
        settings = message;
    }
  
});


function sendFFmpegOptions(ffmpegOptsArray, destName, socket)
{
    console.log("Sending ffmpeg options");
    let tempFFmpegOpts = ffmpegOptsArray.slice();
    tempFFmpegOpts.push(destName);
    socket.emit('ffmpegOpts', tempFFmpegOpts);
}


function startFFmpeg(socket)
{
    console.log("Sending start command for ffmpeg");
    socket.emit('ffmpegStart');
}


socket.on("connect", () =>{
    console.log("Connected to server");

    sendFFmpegOptions(ffmpegOpts[settings.outputType], 
                                settings.outputPath,
                                socket);                               
    startFFmpeg(socket);
    if (recorder.state != "recording"){
        recorder.start(1000);
        console.log("Recorder starting...");
        console.log("Recorder state: " + recorder.state);
    }
});



socket.on("disconnect", (reason) =>{
    console.log("Disconnected from server: %s", reason);
    if (recorder)
    {
        if (recorder.state == "recording")
        {
            recorder.stop();
            console.log("Stopping recorder");
        }
    }
});





function stopCapture()
{
    if (recorder)
    {
        console.log("Stopping recorder");
        recorder.stop();
    }
    if (socket.connected)
    {
        console.log("Disconnecting socket");
        socket.disconnect();
    }
}






function startCapture()
{
    if (settings == null)
    {
        console.log("Cannot start capture! Settings empty!");
        return;
    }
    let videoElements = document.getElementsByTagName('video');

    if (videoElements.length == 0)
    {
        console.log("No video element found");
        return;
    }

    console.log("Found %s video elements", videoElements.length);

    let captureStream;

    let streamFound = false;
    for (let index = 0; index < videoElements.length; index++) {
        captureStream = videoElements[index].captureStream();
        if (captureStream.active == true)
        {
            streamFound = true;            
            console.log("Found an active captureStream");
            break;
        }
    }
    if (streamFound == false)
    {
        console.log("No captureStream valid found");
        return;
    }

    recorder = new MediaRecorder(captureStream);
    recorder.ondataavailable = (event) =>{
        console.log("sending data available: " + event.data.size + " bytes");
        socket.emit('binarydata', event.data);
    };

    recorder.onstart = (event) =>{
        console.log("Recorder started");
    };

    recorder.onstop = (event) =>{

        console.log("Recorder stopped");
    };

    console.log("Connecting to server...");
    socket.connect();
}

