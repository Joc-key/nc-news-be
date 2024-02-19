const seed = require('../db/seeds/seed')
const db = require('../db/connection')
const testData = require('../db/data/test-data/index')
const request = require('supertest')
const app = require('../server/app')
const { getTopics } = require('../server/controller')


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
            .expect((response) => {
                expect(response.body).toHaveProperty('topics');
                expect(response.body.topics).toBeInstanceOf(Array);
            })
    });
    test("should be an object", () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .expect((response) => {
                expect(typeof response.body.topics).toBe('object');
            })
    })
    test("each topic should have 'slug' and 'description' properties", () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .expect((response) => {
                const { topics } = response.body;
                console.log(topics)
                expect(topics).toBeInstanceOf(Array);
                topics.forEach((topic) => {
                    expect(topic).toHaveProperty('slug');
                    expect(topic).toHaveProperty('description');
                });
            })
    });
})