const seed = require('../db/seeds/seed')
const db = require('../db/connection')
const testData = require('../db/data/test-data/index')
const request = require('supertest')
const app = require('../server/app')
const endpoints = require('../endpoints.json')
const toBeSortedBy = require('jest-sorted');
const { fetchTopics, fetchArticleById, fetchArticles, fetchCommentsByArticleId, addComment } = require('../server/model');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('requests', () => {
    test("should return 404 for a non-existing endpoint", () => {
        return request(app)
            .get('/api/biscuits')
            .expect(404);
    })
    test('should give 404 when table not found', () => {
        return request(app)
            .get('/api/userszxc')
            .then(response => {
                expect(response.status).toBe(404);
            })
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
    test('should return 400 for an invalid format', () => {
        return request(app)
            .get('/api/articles/biscuits')
            .expect(400);
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
    test('should return 400 for an incorrect input ID', () => {
        return request(app)
            .get('/api/articles/badformat')
            .expect(400);
    })
    test('should return 200 with articles for a normal topic', () => {
        return request(app)
            .get('/api/articles?topic=cats')
            .expect(200)
    })
    test('should return 200 for a valid topic with no articles', () => {
        return request(app)
            .get('/api/articles?topic=paper')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('msg', 'Topic has no articles');
            })
    })
    test('should return 404 for an invalid topic', () => {
        return request(app)
            .get('/api/articles?topic=invalidTopic')
            .expect(404)
            .expect((res) => {
                expect(res.body).toHaveProperty('msg', 'Topic not found');
            })
    })
})

describe('GET /api/articles/:article_id/comments', () => {
    test('should return an empty array when there are no comments or get all comments for an article', () => {
        return request(app)
          .get(`/api/articles/2/comments`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('comments');
            expect(res.body.comments).toHaveLength(0);
          })
      })
    test('should get all comments for a specific Id and return them in desc order', () => {
        return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .expect((res) => {
                const comments = res.body.comments;
                expect(comments).toBeSortedBy('created_at', { descending: true });
                comments.forEach((comment) => {
                    expect(comment.article_id).toBe(1);
                });
                comments.forEach((comment) => {
                    expect(comment).toHaveProperty('comment_id');
                    expect(comment).toHaveProperty('votes');
                    expect(comment).toHaveProperty('created_at');
                    expect(comment).toHaveProperty('author');
                    expect(comment).toHaveProperty('body');
                    expect(comment).toHaveProperty('article_id', 1);
                })
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
          .get('/api/articles/uh43nn/comments')
          .expect(400)
      });
});

describe('POST /api/articles/:article_id/comments', () => {
    test('should add a comment for an article', () => {
        return request(app)
            .post('/api/articles/1/comments')
            .send({ username: 'butter_bridge', body: 'This is a comment.' })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('comment');
            })
    })
    test('should add a comment for an article, when additional properties are added', () => {
        return request(app)
            .post('/api/articles/1/comments')
            .send({ username: 'butter_bridge', body: 'This is a comment.', text: 'sound mate' })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('comment');
            })
    })
    test('should handle missing properties in the request body', () => {
        return request(app)
            .post('/api/articles/1/comments')
            .send({ body: 'This is a comment.' })
            .expect(400)
            .expect((res) => {
                expect(res.body).toHaveProperty('msg', 'Missing required properties in the request body');
            })
    });
    test('should return 404 for a comment when user is not in the database', () => {
        return request(app)
            .post('/api/articles/1/comments')
            .send({ username: 'dave_jeff', body: 'sdfsdf' })
            .expect(404)
            .expect((res) => {
                expect(res.body).toHaveProperty('msg', 'User not found');
            })
    });
    test('should return 404 for an article ID that doesn\'t exist', () => {
        return request(app)
            .post('/api/articles/12345/comments')
            .send({ username: 'butter_bridge', body: 'This is a comment.' })
            .expect(404)
            .expect((res) => {
                expect(res.body).toHaveProperty('msg', 'Article not found');
            })
    })
    test('should return 400 for a non-numeric article ID', () => {
        return request(app)
            .post('/api/articles/invalid_id/comments')
            .send({ username: 'butter_bridge', body: 'This is a comment.' })
            .expect(400)
            .expect((res) => {
                expect(res.body).toHaveProperty('msg', 'Invalid input syntax');
            })
    })
})

describe('PATCH /api/articles/:article_id', () => {
    test('should update the votes property of an article', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: 1 })
        .expect(200)
        .expect((res) => {
            const updatedArticle = res.body.article;
            expect(updatedArticle.votes).toBe(101);
        })
    })
    test('should decrease the votes property of an article', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: -100 })
        .expect(200)
        .expect((res) => {
            const updatedArticle = res.body.article;
            expect(updatedArticle.votes).toBe(0);
        })
    })
    test('should return 404 for an incorrect article ID', () => {
      return request(app)
        .patch('/api/articles/12345')
        .send({ inc_votes: 1 })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('msg', 'Article not found');
        })
    })
    test('should return 400 for a non-numeric article ID', () => {
      return request(app)
        .patch('/api/articles/invalid_id')
        .send({ inc_votes: 1 })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('msg', 'Invalid input syntax');
        })
    })
    test('should return 400 for missing inc_votes in the request body', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('msg', "Invalid or missing inc_votes property in the request body");
        })
    })
    test('should return 400 for invalid inc_votes value in the request body', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: '' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('msg', "Invalid or missing inc_votes property in the request body");
        })
    })
})

describe('DELETE /api/comments/:comment_id', () => {
    test('should delete a comment and respond with status 204', () => {
      return request(app)
        .delete('/api/comments/1')
        .expect(204);
    });
    test('should respond with status 404 for an invalid comment_id', () => {
      return request(app)
        .delete('/api/comments/124141')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('msg', 'Comment not found');
        });
    })
    test('should respond with status 400 for an invalid comment_id format', () => {
        return request(app)
          .delete('/api/comments/invalidFormat')
          .expect(400)
          .expect((res) => {
            expect(res.body).toHaveProperty('msg', 'Invalid input syntax');
          })
      })
})

describe('GET /api/users', () => {
    test('should return an array of users with username, name, and avatar_url properties', () => {
        return request(app)
            .get('/api/users')
            .then(response => {
                expect(response.status).toBe(200);

                const users = response.body.users;
                expect(Array.isArray(users)).toBe(true);
                expect(users.length).toBeGreaterThanOrEqual(0)

                users.forEach((user) => {
                    expect(user).toHaveProperty('username');
                    expect(user).toHaveProperty('name');
                    expect(user).toHaveProperty('avatar_url');
                })
            })
    })
})