const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs')

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.post('/search', (req, res) => {
    const searchString = req.body.searchString;
})

app.get('/wordlist', (req, res) => {
    fs.readFile(__dirname + '/public/dictionary.txt', (err, data) => {
        if (err) throw err;

        let words = data.toString().toLowerCase().split('\n')
        res.send(words)
    })
})

app.listen(3001, () => {
    console.log('Server running on port 3001');
})