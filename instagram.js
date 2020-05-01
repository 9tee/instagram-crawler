const puppeteer = require('puppeteer');
var Crawler = require("crawler");
var fs = require('fs');
var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;

const insta = process.argv[2];
if (!insta){
    throw "phải có tên instagram";
}


var c = new Crawler({
    encoding: null,
    jQuery: false,// set false to suppress warning message.
    callback: function (err, res, done) {
        if (err) {
            console.error(err.stack);
        } else {
            fs.createWriteStream( './' + insta + '/' + res.options.filename).write(res.body);
            console.log(res.options.filename);
        }

        done();
    }
});


function download(results) {
    fs.mkdir(insta , { recursive: true }, (err) => {
        if (err) throw err;
      });
    results.forEach(item => {
        setTimeout(function () {
            c.queue({
                filename: results.indexOf(item).toString(),
                uri: item.src                
            });
        }, 1000 * results.indexOf(item));
    });
}

function run() {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto("https://www.instagram.com/"+ insta +"/");
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document.querySelectorAll('div.KL4Bh img');
                items.forEach((item) => {
                    results.push({
                        alt: item.alt,
                        src: item.src,
                    });
                });
                return results;
            })
            browser.close();
            return resolve(urls);
        } catch (e) {
            return reject(e);
        }
    })
}
run().then(download).catch(console.error);
