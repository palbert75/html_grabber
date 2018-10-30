const puppeteer = require('puppeteer');
const uniqid = require('uniqid');
const fs = require('fs');
const express = require('express')
const app = express();
const bodyParser = require('body-parser');

const port = 3000



app.listen(port, () => console.log(`Server app listening on port ${port}!`))
app.use(bodyParser.json({
    limit: '10mb',
    extended: true
}))
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}))

app.post('/api/video', (req, res) => {
    var image = req.body.image;
    var width = req.body.width;
    var height = req.body.height;
    var template = __dirname + '/' + req.body.template + "/index.html";
    var length = req.body.length;
    var frameRate = req.body.frameRate != null ? req.body.frameRate : 30;
    var startFrame = req.body.startFrame != null ? req.body.startFrame : 0;

    var requestID = uniqid();

    console.log("Incoming video request " + requestID + " resolution (" + width + "x" + height + ") " + frameRate + "frame/s for " + length +
        "s  starting at frame:" + startFrame + " using template " + template);

    puppeteer.launch({
        headless: true
    }).then(async browser => {

        const page = await browser.newPage();

        await page.setViewport({
            width: width,
            height: height
        })

        page.on('console', msg => console.log('PAGE LOG (' + requestID + '):', msg.text()));

        await page.exposeFunction('saveVideo', video => {

            // Remove header
            let base64Image = video.split(';base64,').pop();
            var fileName = 'output/' + requestID + '.webm';

            fs.writeFile(fileName, base64Image, {
                encoding: 'base64'
            }, async function (err) {
                console.log('File ' + fileName + ' has been created ');
                await page.close();
                await browser.close();
                res.sendFile(fileName, {
                    root: __dirname
                });
            });
        });

        fs.readFile(template, 'utf8', async function (err, contents) {
            if (!err) {
                await page.setContent(contents);
                await page.evaluate((image) => {
                    setImage(image);
                }, image);
                await page.evaluate((frameRate, frame, startFrame) => {
                    startCapture("video", frameRate, frame, startFrame);
                }, frameRate, frameRate * length, startFrame);
            } else {
                console.log("Error (" + err + ") occured for request " + requestID);
            }

        });
    });
});

app.post('/api/image', (req, res) => {
    var image = req.body.image;
    var width = req.body.width;
    var height = req.body.height;
    var template = __dirname + '/' + req.body.template + "/index.html";
    var requestID = uniqid();

    var fileName = 'output/' + requestID + '.png';
    var startFrame = req.body.startFrame != null ? req.body.startFrame : 0;

    var requestID = uniqid();

    console.log("Incoming image request " + requestID + " resolution (" + width + "x" + height + ") starting at frame:" +
        startFrame + " using template " + template);

    puppeteer.launch({
        headless: true
    }).then(async browser => {
        const page = await browser.newPage();
        await page.setViewport({
            width: width,
            height: height
        })

        page.on('console', msg => console.log('PAGE LOG (' + requestID + '):', msg.text()));
        await page.exposeFunction('saveImage', image => {


            // Remove header
            let base64Image = image.split(';base64,').pop();
            var fileName = 'output/' + requestID + '.png';

            fs.writeFile(fileName, base64Image, {
                encoding: 'base64'
            }, async function (err) {
                console.log('File ' + fileName + ' has been created ');

                res.sendFile(fileName, {root: __dirname});
                await page.close();
                await browser.close();
            });
        });

        fs.readFile(template, 'utf8', async function (err, contents) {
            if (!err) {
                await page.setContent(contents);
                await page.evaluate((image) => {
                    setImage(image);
                }, image);
                
                await page.evaluate((frameRate, frame, startFrame) => {
                    startCapture("image", frameRate, frame, startFrame);
                }, 0, 1, startFrame);
            } else {
                console.log("Error (" + err + ") occured for request " + requestID);
            }
        });
    });
});


//ffmpeg -i screenshots_%03d.png video_name.avi