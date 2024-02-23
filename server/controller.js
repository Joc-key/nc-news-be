const { fetchTopics, fetchArticleById, fetchArticles, fetchCommentsByArticleId, addComment, checkUsers, updateVotes, fetchCommentById, deleteComment, fetchUsers } = require('./model');

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

    Promise.all([checkUsers(username), fetchArticleById(article_id), addComment(article_id, username, body)])
        .then((comment) => {
            res.status(201).send({ comment });
        })
        .catch(next);
}

exports.updateArticle = (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

    if (!inc_votes || typeof inc_votes !== 'number') {
        return res.status(400).send({ msg: 'Invalid or missing inc_votes property in the request body' });
    }

    fetchArticleById(article_id)
        .then((article) => {
            return updateVotes(article_id, inc_votes);
        })
        .then((updatedArticle) => {
            res.status(200).send({ article: updatedArticle });
        })
        .catch(next)
}

exports.deleteCommentById = (req, res, next) => {
    const { comment_id } = req.params;

    fetchCommentById(comment_id)
        .then(() => {
            return deleteComment(comment_id);
        })
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
}

exports.getUsers = (req, res, next) => {
    fetchUsers()
        .then((users) => {
            res.status(200).send({ users });
        })
        .catch(next);
};