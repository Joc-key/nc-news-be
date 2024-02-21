const express = require('express');
const app = express();
const { getTopics, getArticleById, getArticles, getCommentsByArticleId } = require('./controller');
const endpoints = require('../endpoints.json')

app.get('/api', (req, res) => {
    res.status(200).json(endpoints)
})

app.get('/api/topics', getTopics);

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments',getCommentsByArticleId )

app.all('/*', (req, res, next)=> {
    res.status(404).send({ msg: 'Path not found' })
});

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        next(err);
    }
});

module.exports = app;