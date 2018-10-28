const puppeteer = require('puppeteer');
const uniqid = require('uniqid');
const fs = require('fs');
const express = require('express')
const app = express();
const bodyParser = require('body-parser');

const port = 3000



app.listen(port, () => console.log(`Server app listening on port ${port}!`))
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

app.post('/api/video', (req, res) => {
    var image = req.body.image;
    var width = req.body.width;
    var height = req.body.height;
    var template = __dirname + '/' + req.body.template + "/index.html";
    var length = req.body.length;
    var frameRate = req.body.frameRate;

    var requestID= uniqid();
  
    console.log("Incoming video request " +  requestID + " resolution (" + width +"x" + height+") "+ frameRate + "frame/s for "+ length +"s template "+ template);

    puppeteer.launch({
        headless: true
    }).then(async browser => {
        const page = await browser.newPage();
        await page.setViewport({
            width: width,
            height: height
        })

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        await page.exposeFunction('saveVideo', video => {
            
          
            // Remove header
            let base64Image = video.split(';base64,').pop();
            //  console.log(base64Image);
            var fileName= requestID + '.webm';

            fs.writeFile('output/' + fileName, base64Image, {
                encoding: 'base64'
            }, async function (err) {
                console.log('File ' + fileName + ' has been created ');
                await page.close();
                await browser.close();
                res.sendFile('output/' + fileName, { root: __dirname });
            });


        });

        var contentHtml = fs.readFileSync(template, 'utf8');
        await page.setContent(contentHtml); 
        await page.evaluate((image) => { setImage(image); }, image);
        await page.evaluate((frameRate, frame) => { startCaptureVideo(frameRate, frame); }, frameRate, frameRate * length);
        
        //await page.evaluate(() => console.log(`url is ${location.href}`));



        //        fs.writeFileSync('', base64Data,  "base64");
        // page.close();
        // browser.close();
    });


});

app.post('/api/image', (req, res) => {
    var image = req.body.image;
    var width = req.body.width;
    var height = req.body.height;
    var template = __dirname + '/' + req.body.template + "/index.html";
    var requestID= uniqid();

    var fileName= requestID + '.png';

    console.log("Incoming image request " +  requestID + " resolution (" + width +"x" + height+") for template "+ template);

    puppeteer.launch({
        headless: true
    }).then(async browser => {
        const page = await browser.newPage();
        await page.setViewport({
            width: 800,
            height: 1200
        })

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        var contentHtml = fs.readFileSync(template, 'utf8');
        await page.setContent(contentHtml); 
        await page.evaluate((image) => { setImage(image); }, image);

       
        await page.screenshot({ path: 'output/' + fileName, fullPage: true });

        res.sendFile('output/' + fileName, { root: __dirname });
        console.log('File ' + fileName + " has been created.");
        await page.close();
        await browser.close();       
    });


});


//ffmpeg -i screenshots_%03d.png video_name.avi
