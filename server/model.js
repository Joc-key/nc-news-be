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


module.exports = { fetchTopics, fetchArticleById }