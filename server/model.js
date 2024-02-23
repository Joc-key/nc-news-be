const db = require('../db/connection')

function fetchTopics() {
    return db.query(`SELECT slug, description FROM topics;`)
    .then((data) => {
        return data.rows
    })
}

function fetchArticleById(article_id) {
    return db.query(`
        SELECT
        author,
        title,
        article_id,
        body,
        topic,
        created_at,
        votes,
        article_img_url
        FROM articles
        WHERE article_id = $1;
    `, [article_id])
    .then((data) => {
        if (data.rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'Article not found' });
        }
        return data.rows[0];
    });
}

function fetchArticles() {
    return db.query(`
        SELECT 
        articles.author, 
        articles.title, 
        articles.article_id, 
        articles.topic, 
        articles.created_at, 
        articles.votes, 
        articles.article_img_url, 
        COUNT(comments.article_id) AS comment_count
        FROM articles 
        LEFT JOIN comments ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC;
    `)
    .then((data) => {
        return data.rows
    })
}

function fetchCommentsByArticleId(article_id) {
    return db.query(`
        SELECT 
        comment_id,
        votes,
        created_at,
        author,
        body,
        article_id
        FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC;
    `, [article_id])
    .then((data) => {
        return data.rows;
    });
}

function addComment(article_id, username, body) {
    return db.query(`
        INSERT INTO comments (article_id, author, body)
        VALUES ($1, $2, $3)
        RETURNING *;
    `, [article_id, username, body])
    .then((data) => {
        if (data.rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'Article not found' });
        }
        return data.rows[0];
    })
}

function checkUsers(username) {
    return db.query(`
        SELECT username FROM users
        WHERE username = $1;
    `, [username])
    .then((data) => {
        if (data.rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'User not found'})
        }
    })
}

function updateVotes(article_id, inc_votes) {
    return db.query(`
        UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *;
    `, [inc_votes, article_id])
    .then((data) => {
        if (data.rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'Article not found' });
        }
        return data.rows[0];
    })
}

function fetchCommentById(comment_id) {
    return db.query(`
        SELECT * FROM comments
        WHERE comment_id = $1;
    `, [comment_id])
    .then((data) => {
        if (data.rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'Comment not found' });
        }
        return data.rows[0];
    });
}

function deleteComment(comment_id) {
    return db.query(`
        DELETE FROM comments
        WHERE comment_id = $1;
    `, [comment_id]);
}

module.exports = { fetchTopics, fetchArticleById, fetchArticles, fetchCommentsByArticleId, addComment, checkUsers, updateVotes, fetchCommentById, deleteComment }