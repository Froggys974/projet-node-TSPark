import request from 'supertest';
import { createApp } from '../../src/index';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

let app: any;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

beforeAll(async () => {
    app = await createApp(mongoose.connection);
});

describe('Gyms Routes', () => {

    function generateToken(userId: string, role: string) {
        return jwt.sign({ userId, role, email: 'test@test.com' }, JWT_SECRET);
    }

    async function createFixtures() {
        const userRes = await request(app).post('/auth/register/gym-owner').send({
            email: `gymowner_${Date.now()}_${Math.random()}@test.com`,
            password: 'Test@1234',
            firstName: 'Gym',
            lastName: 'Owner'
        });
        expect(userRes.status).toBe(201);
        const { token, user } = userRes.body;
        return { userId: user._id, token };
    }

    it('POST /gyms should create a gym', async () => {
        const { userId, token } = await createFixtures();
        const res = await request(app).post('/gyms')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'My Gym',
                address: '123 Fitness St',
                ownerId: userId,
                description: 'Best gym'
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.name).toBe('My Gym');
    });

    it('GET /gyms should return all gyms', async () => {
        const { userId, token } = await createFixtures();
        await request(app).post('/gyms')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'List Gym',
                address: '456 List St',
                ownerId: userId
            });

        const res = await request(app).get('/gyms');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /gyms/:id should return a gym by id', async () => {
        const { userId, token } = await createFixtures();
        const create = await request(app).post('/gyms')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Get Gym',
                address: '789 Get St',
                ownerId: userId
            });
        const id = create.body._id;

        const res = await request(app).get(`/gyms/${id}`);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(id);
    });

    it('PUT /gyms/:id should update a gym', async () => {
        const { userId, token } = await createFixtures();
        const create = await request(app).post('/gyms')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Update Gym',
                address: '101 Update St',
                ownerId: userId
            });
        const id = create.body._id;

        const res = await request(app).put(`/gyms/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Updated Gym Name'
            });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Updated Gym Name');
    });

    it('DELETE /gyms/:id should delete a gym', async () => {
        const { userId } = await createFixtures(); 
        const token = generateToken(userId, 'ADMIN');
        const ownerToken = generateToken(userId, 'GYM_OWNER');
        const create = await request(app).post('/gyms')
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({
                name: 'Delete Gym',
                address: '202 Delete St',
                ownerId: userId
            });
        const id = create.body._id;

        const res = await request(app).delete(`/gyms/${id}`)
             .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(204);
    });
});
