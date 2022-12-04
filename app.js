const http = require("http");
const fs = require('fs').promises;
const host = 'localhost';
const port = 80;

const requestListener = function (req, res) {
    let url = req.url.split('?')[0];
    if(url == '/') {
        console.log('homepage')
        url = '/index.html';
    }
    try {
        const urls = __dirname + "/dist" + url + (url.includes('.js') || url.includes('.ico') || url.includes('.html') ? '' : '.html');
        fs.readFile(urls)
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })
    } catch(e) {

    }
};



const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
