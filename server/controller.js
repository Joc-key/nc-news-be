const { fetchTopics, fetchArticleById, fetchArticles, fetchCommentsByArticleId } = require('./model');

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

    if (!/^\d+$/.test(article_id)) {
        return res.status(400).send({ msg: 'Invalid article ID format' });
    }

    fetchArticleById(article_id)
        .then((article) => fetchCommentsByArticleId(article_id))
        .then((comments) => res.status(200).send({ comments }))
        .catch(next);
};
