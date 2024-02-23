const express = require('express');
const app = express();
const { getTopics, getArticleById, getArticles, getCommentsByArticleId, addCommentToArticle, updateArticle, deleteCommentById, getUsers } = require('./controller');
const endpoints = require('../endpoints.json')

app.use(express.json());

app.get('/api', (req, res) => {
    res.status(200).json(endpoints)
})

app.get('/api/topics', getTopics);

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments',getCommentsByArticleId)

app.get('/api/users', getUsers)

app.post('/api/articles/:article_id/comments', addCommentToArticle)

app.patch('/api/articles/:article_id', updateArticle);

app.delete('/api/comments/:comment_id', deleteCommentById)

app.all('/*', (req, res, next)=> {
    res.status(404).send({ msg: 'Path not found' })
});

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({ msg: 'Invalid input syntax' })
    }
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        next(err);
    }
});

module.exports = app;