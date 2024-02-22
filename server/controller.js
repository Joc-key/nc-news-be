const { fetchTopics, fetchArticleById, fetchArticles, fetchCommentsByArticleId, addComment } = require('./model');

exports.getTopics = (req, res, next) => {
    fetchTopics()
        .then((topics) => {
            res.status(200).send({ topics })
        })
}

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params

    fetchArticleById(article_id)
        .then((article) => {
            res.status(200).send({ article })
        })
        .catch(next)
}

exports.getArticles = (req, res, next) => {
    fetchArticles(req.query)
        .then((articles) => {
            res.status(200).send({ articles })
        })
        .catch(next)
}

exports.getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params;

    fetchArticleById(article_id)
        .then((article) => {
            return fetchCommentsByArticleId(article_id);
        })
        .then((comments) => {
            res.status(200).send({ comments });
        })
        .catch(next)
}

exports.addCommentToArticle = (req, res, next) => {
    const { article_id } = req.params;
    const { username, body } = req.body;

    if (!username || !body) {
        return res.status(400).send({ msg: 'Missing required properties in the request body' });
    }

    fetchArticleById(article_id)
        .then(() => addComment(article_id, username, body))
        .then((comment) => {
            res.status(201).send({ comment });
        })
        .catch(next);
}
