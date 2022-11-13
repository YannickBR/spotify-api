const http = require("http");
const fs = require('fs').promises;
const host = 'localhost';
const port = 80;

const requestListener = function (req, res) {
    let url = req.url.split('?')[0];
    console.log(url);
    if(req.url == '/') {
        url = '/index.html';
    }
        fs.readFile(__dirname + '/src' + url)
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })
};



const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
