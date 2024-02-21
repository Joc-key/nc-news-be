const seed = require('../db/seeds/seed')
const db = require('../db/connection')
const testData = require('../db/data/test-data/index')
const request = require('supertest')
const app = require('../server/app')
const endpoints = require('../endpoints.json')
const toBeSortedBy = require('jest-sorted');
const { fetchTopics, fetchArticleById, fetchArticles, fetchCommentsByArticleId } = require('../server/model');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('requests', () => {
    test("should return 404 for a non-existing endpoint", () => {
        return request(app)
            .get('/api/biscuits')
            .expect(404);
    })
})

describe('getTopics',() => {
    test("should get all topics /api/topics", () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('topics');
                expect(res.body.topics).toBeInstanceOf(Array);
            })
    });
    test("should be an object", () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .expect((res) => {
                expect(typeof res.body.topics).toBe('object');
            })
    })
    test("each topic should have 'slug' and 'description' properties", () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .expect((res) => {
                const { topics } = res.body;
                expect(topics).toBeInstanceOf(Array);
                topics.forEach((topic) => {
                    expect(topic).toHaveProperty('slug');
                    expect(topic).toHaveProperty('description');
                });
            })
    });
})

describe('GET /api', () => {
    test('should return all available endpoints', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .expect((res) => {
                expect(res.body).toEqual(endpoints);
            });
    });
});

describe('GET /api/articles/:article_id', () => {
    test('should return an article by id', () => {
        return request(app)
            .get('/api/articles/1')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('article')
            })
    });
    test('should have all properties in the object', () => {
        return request(app)
            .get('/api/articles/1')
            .expect(200)
            .expect((res) => {
                const article = res.body.article;
                expect(article).toHaveProperty('author');
                expect(article).toHaveProperty('title');
                expect(article).toHaveProperty('article_id');
                expect(article).toHaveProperty('body');
                expect(article).toHaveProperty('topic');
                expect(article).toHaveProperty('created_at');
                expect(article).toHaveProperty('votes');
                expect(article).toHaveProperty('article_img_url');
            });
    })
    test('should have correct data types in object', () => {
        return request(app)
            .get('/api/articles/1')
            .expect(200)
            .expect((res) => {
                const article = res.body.article;
                expect(typeof article.author).toBe('string');
                expect(typeof article.title).toBe('string');
                expect(typeof article.article_id).toBe('number');
                expect(typeof article.body).toBe('string');
                expect(typeof article.topic).toBe('string');
                expect(typeof article.created_at).toBe('string');
                expect(typeof article.votes).toBe('number');
                expect(typeof article.article_img_url).toBe('string');
            })
    });
    test('should return 404 for an incorrect Id', () => {
        return request(app)
            .get('/api/articles/12345')
            .expect(404)
    })
    test('should return 500 for an invalid format', () => {
        return request(app)
            .get('/api/articles/biscuits')
            .expect(500);
    })
})

describe('GET /api/articles', () => {
    test('should return all articles as an array', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .expect((res) => {
            expect(res.body).toHaveProperty('articles');
            expect(res.body.articles).toBeInstanceOf(Array);
        })
    })
    test('should return articles with correct properties', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .expect((res) => {
        res.body.articles.forEach((article) => {
            expect(article).toHaveProperty('author');
            expect(article).toHaveProperty('title');
            expect(article).toHaveProperty('article_id');
            expect(article).toHaveProperty('topic');
            expect(article).toHaveProperty('created_at');
            expect(article).toHaveProperty('votes');
            expect(article).toHaveProperty('article_img_url');
            expect(article).toHaveProperty('comment_count');
            })
        })
    })
    test('should not be a body property present on any of the article objects', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .expect((res) => {
        res.body.articles.forEach((article) => {
            expect(article).not.toHaveProperty('body');
            })
        })
    })
    test('should return articles sorted by date in descending order', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .expect((res) => {
                const articles = res.body.articles;
                for (let i = 0; i < articles.length - 1; i++) {
                    const currentArticleDate = new Date(articles[i].created_at).getTime();
                    const nextArticleDate = new Date(articles[i + 1].created_at).getTime();
                    expect(currentArticleDate).toBeGreaterThanOrEqual(nextArticleDate);
                }
            });
    })
    test('should return 404 when wrong input', () => {
        return request(app)
            .get('/api/biscuits')
            .expect(404);
    })
    test('should return 404 for an incorrect ID', () => {
        return request(app)
            .get('/api/articles/12345')
            .expect(404);
    })
    test('should return 500 for an incorrect input ID', () => {
        return request(app)
            .get('/api/articles/badformat')
            .expect(500);
    })
})

describe('GET /api/articles/:article_id/comments', () => {
    test('should return an empty array when there is no comments', () => {
        return request(app)
          .get('/api/articles/2/comments')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('comments');
            expect(res.body.comments).toBeInstanceOf(Array);
            expect(res.body.comments).toHaveLength(0);
          });
      });
    test('should get all comments for an article', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .expect((res) => {
            expect(res.body).toHaveProperty('comments');
            expect(res.body.comments).toBeInstanceOf(Array);
        })
    })
    test('should get all comments for an article and return them in descending order', () => {
        return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .expect((res) => {
            const comments = res.body.comments[0]
            expect(res.body.comments).toBeSortedBy('created_at', { descending: true });
            expect(comments).toHaveProperty('comment_id');
            expect(comments).toHaveProperty('votes');
            expect(comments).toHaveProperty('created_at');
            expect(comments).toHaveProperty('author');
            expect(comments).toHaveProperty('body');
            expect(comments).toHaveProperty('article_id');
          })
      })
      test('should give 404 for incorrect Id', () => {
        return request(app)
          .get('/api/articles/94613/comments')
          .expect(404)
          .expect((res) => {
            expect(res.body).toHaveProperty('msg', 'Article not found');
          })
      })
      test('should return 400 for an invalid article ID format', () => {
        return request(app)
          .get('/api/articles/biscuits/comments')
          .expect(400);
      });
});

