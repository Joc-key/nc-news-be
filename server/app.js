const express = require('express');
const app = express();
const { getTopics } = require('./controller');

app.get('/api/topics', getTopics);

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        next(err);
    }
});

module.exports = app;