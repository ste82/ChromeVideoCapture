# ChromeVideoCapture
Chrome extension to capture *&lt;video>* tag stream and save it to file or transcoding with FFmpeg

## Requisites
- NodeJS server running *VideoCaptureServer.js*
- FFmpeg

## Use
- Start *VideoCaptureServer.js* with full path of FFmpeg binary as argument. Example:
```
> nodejs VideoCaptureServer.js /usr/bin/ffmpeg
```
- Load Chrome extension in developer mode
- Pin the extension icon in the toolbar to lock it and click it to open the popup
- Insert the file output path (.webm to save as file without transcoding or .m3u8 for HLS streaming)
- Open a website containing the video and press **Start capture**
