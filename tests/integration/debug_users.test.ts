
import request from 'supertest';
import { createApp } from '../../src/index';
import mongoose from 'mongoose';

let app: any;

beforeAll(async () => {
    // Connect to DB directly
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI_TEST || "mongodb://localhost:27017/test_db");
    }
    app = await createApp(mongoose.connection);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Debug User Routes', () => {
    it('POST /users should create a user or log error', async () => {
        const payload = {
            name: 'debugUser',
            email: 'debug@example.com',
            password: 'password123'
        };
        const res = await request(app).post('/users').send(payload);
        if (res.status !== 201) {
            console.log("DEBUG ERROR RESPONSE:", JSON.stringify(res.body, null, 2));
            console.log("DEBUG STATUS:", res.status);
            console.log("DEBUG TEXT:", res.text);
        }
        expect(res.status).toBe(201);
    });
});
