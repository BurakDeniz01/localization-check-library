const express = require('express');
const cors = require('cors');
const formidable = require('formidable')
const app = express();
const port = 8080;
app.use(cors());
app.options('*', cors());
const utils = require("./utils")

// sendFile will go here
app.get('/', async function (req, res) {
    const template = await utils.createHTML()
    res.send(template);
});

app.post('/save', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields) => {
        await utils.writeFile(fields)
        res.send('Saved');
    });
});
app.listen(port);
console.log('Server started at http://localhost:' + port);