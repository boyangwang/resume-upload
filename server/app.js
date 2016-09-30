const express = require('express');
const path = require('path');
const config = require('./config.js');
const logger = require('winston');
const packageJson = require('../package.json');
const fs = require('fs');
const upload = require('multer')({ dest: '/var/www/html/' });

const publicDirectoryPath = path.join(__dirname, '../public');
const app = module.exports = express();
app.use(express.static(publicDirectoryPath));
app.get('/js/babel-polyfill.min.js', (req, res) => {
    res.status(200).contentType('application/javascript').sendFile(path.join(
        __dirname, '../node_modules/babel-polyfill/dist/polyfill.min.js'));
});
app.post('/upload', upload.single('resume'), (req, res) => {
    logger.info(req.file);
    logger.info(req.body.password);
    if (!config.password || req.body.password !== config.password) {
        return void (res.status(403).send('Forbidden'));
    }
    fs.rename(req.file.path, '/var/www/html/resume.pdf', (err) => {
        if (err) {
            logger.warn('ERR: ', err);
        }
    });
    res.status(200).send('Ok');
});
app.use((req, res) => {
    res.status(404).contentType('text/plain').send('Not found');
});
app.server = app.listen(config.port, () => logger.info(`${packageJson.name} server listening on ${config.port}...`));
