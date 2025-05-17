const http = require('http');
const capitalize = require('capitalize')

const server = http.createServer((req, res) => {

    console.log("Node server is working....");
    const url = req.url;
    const method = req.method;

    if(url === "/"){
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("Hello World".toUpperCase());
        res.end();
    }

    if(url === "/users"){
        res.setHeader("Content-Type", "text/html");
        res.statusCode = 200;
        res.write("Hello Users".toUpperCase());
        res.end();
    }

});

 server.listen(8080);