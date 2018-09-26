const HOST = '0.0.0.0';
const PORT = '8080';

const express = require('express');
const app = express();

app.use('/', express.static(__dirname));

app.listen(PORT, () => console.log(`Listening on ${HOST}:${PORT}`));