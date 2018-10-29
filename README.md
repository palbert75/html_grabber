[[_TOC_]]

## Server

After clone run npm install.

Run  the server with `npm run grab`

The server can grab png or web video from your html canvas animation using [ccapture](https://github.com/spite/ccapture.js/). We are using headless chrome browser for this ([puppeteer](https://github.com/GoogleChrome/puppeteer)) and the node.js express framework. 

Place the html templates in templates directory. The html pages which can be grabbed must provide some js functions like:

  
```
function startCaptureVideo(frameRate, frames) {

            capturer = new CCapture({
                framerate: frameRate,
                quality: 100,
                verbose: false,
                format: 'webm'
            });

            console.log("Created capturer with frameRate:" + frameRate + " and capturing " + frames + ".");
            capturer.start();
            FRAMES_END = frames;
            captureImage = false;
        }
```


Check the examplein templates/tmp001/index.html for further details.

Currently there are 2 POST HTML endpoints:

/api/video       - returns the rendered video as response
/api/image      - returns the rendered image as response

The rendered files will be stored in output directory too with a uniq request ID.

## Client

Client shall reach the Server endpoints with POST HTML request. The request body can contain the following json which is used for parametrise the request:


```
{
   "image" : "<base64 encoded background image>"
    "template":   "templates/tmp001",
    "width" : 800,
    "height" : 1200,
    "length" : 3,
    "frameRate" : 30
}
```
length und frameRate parameters are optional, and will be used only in video export.

You can emulate the client via curl see the example files  in test directory:

test/test.json
test/test.sh

```
curl -vX POST http://127.0.0.1:3000/api/image -d @test.json  --header "Content-Type: application/json"
curl -vX POST http://127.0.0.1:3000/api/video -d @test.json  --header "Content-Type: application/json"
```


