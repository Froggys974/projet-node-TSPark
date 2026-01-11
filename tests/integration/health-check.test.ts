import request from 'supertest';
import { createApp } from '../../src/index';
import mongoose from 'mongoose';

let app: any;

beforeAll(async () => {
    app = await createApp(mongoose.connection);
});

describe('GET /health-check', () => {
    it('should return 204 No Content', async () => {
        const response = await request(app).get('/health-check');
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
    });
});
