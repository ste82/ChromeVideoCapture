
const { ChildProcess } = require("child_process");
const { createServer } = require("http");
const { exit } = require("process");
const  { Server } = require("socket.io");
const portNumber = 3000;
const httpServer = createServer();
const io = new Server(httpServer,{
    cors: {
        origin: "*"
    },
    maxHttpBufferSize: 1e7
});

const spawn = require('child_process').spawn;

let ffmpegOpts = null;


function ffmpegStop(ffmpegProc){
    if (ffmpegProc.exitCode == null && ffmpegProc.pid !== undefined) // If it's running
    {
        ffmpegProc.stdin.end();
        ffmpegProc.kill('SIGINT');
        console.log("FFmpeg killed");
    }
}


let ffmpegOutput = function(data){
    //console.log("%s", data);
}


io.on("connection", (socket) => {
    console.log("Socket connected: %s" , socket.id);

    let ffmpeg_process;

    socket.on('ffmpegStart', msg => {
        console.log("FFmpeg start received");

        if (ffmpegOpts == null){
            console.log("Cannot start FFmpeg! Options not received!");
            return;
        }
        ffmpeg_process = spawn(process.argv[2], ffmpegOpts);

        ffmpeg_process.on('spawn', () => {
            console.log('FFmpeg started');
        });

        ffmpeg_process.stdout.on('data', data => ffmpegOutput(data));
        ffmpeg_process.stderr.on('data', data => ffmpegOutput(data));
        
        ffmpeg_process.stdin.on('error', (err) => {
            console.log("Error writing to stdin: %s", err.message);
        });
    
        ffmpeg_process.on('exit', (data) => {
            ffmpegStarted = false;
            console.log('FFmpeg closed');
            socket.disconnect();
        });
        
    });

    socket.on('ffmpegOpts', msg => {
        console.log("FFmpeg options received: %s", msg);
        ffmpegOpts = msg;
    });


    socket.on('binarydata', msg => {
        console.log("Data size received: %s", Object.values(msg).length);
        if (ffmpeg_process && ffmpeg_process.pid !== undefined)
        {
            if (ffmpeg_process.stdin)
            {
                if (ffmpeg_process.stdin.writable)
                {
                    ffmpeg_process.stdin.write(msg);
                }
            }
        }
    });


    socket.on("disconnect", reason => {
        console.log('Socket disconnected. Reason: %s', reason);
        ffmpegStop(ffmpeg_process);
    });
    
});

if (process.argv.length != 3)
{
    console.log('Missing FFmpeg path argument');
    exit(1);
}
httpServer.listen(portNumber);
console.log("Listening port %d", portNumber);