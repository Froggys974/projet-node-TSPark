import request from 'supertest';
import { createApp } from '../../src/index';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

let app: any;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

beforeAll(async () => {
    app = await createApp(mongoose.connection);
});

describe('Badges Routes', () => {

    function generateToken(userId: string, role: string) {
        return jwt.sign({ userId, role, email: 'test@test.com' }, JWT_SECRET);
    }
    
    const adminId = new mongoose.Types.ObjectId().toString();
    const adminToken = generateToken(adminId, 'ADMIN');

    it('POST /badges should create a badge', async () => {
        const res = await request(app).post('/badges')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Badge',
                description: 'A test badge',
                icon: 'icon-url',
                rarity: 'common',
                category: 'achievement',
                criteria: {
                    type: 'total_calories',
                    threshold: 100
                },
                points: 50
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
    });

    it('GET /badges should return all badges', async () => {
        await request(app).post('/badges')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'List Badge',
                description: 'Desc',
                icon: 'icon',
                rarity: 'common',
                category: 'achievement',
                criteria: { type: 'streak_days', threshold: 5 },
                points: 10
            });

        const res = await request(app).get('/badges')
             .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /badges/:id should return a badge by id', async () => {
        const create = await request(app).post('/badges')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Get Badge',
                description: 'Desc',
                icon: 'icon',
                rarity: 'common',
                category: 'achievement',
                criteria: { type: 'workout_count', threshold: 10 },
                points: 20
            });
        const id = create.body._id;

        const res = await request(app).get(`/badges/${id}`)
             .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(id);
    });

    it('PUT /badges/:id should update a badge', async () => {
        const create = await request(app).post('/badges')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Update Badge',
                description: 'Desc',
                icon: 'icon',
                rarity: 'common',
                category: 'achievement',
                criteria: { type: 'total_calories', threshold: 500 },
                points: 100
            });
        const id = create.body._id;

        const res = await request(app).put(`/badges/${id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Updated Name Badge'
            });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Updated Name Badge');
    });

    it('DELETE /badges/:id should delete a badge', async () => {
        const create = await request(app).post('/badges')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Delete Badge',
                description: 'Desc',
                icon: 'icon',
                rarity: 'common',
                category: 'achievement',
                criteria: { type: 'total_calories', threshold: 1000 },
                points: 200
            });
        const id = create.body._id;

        const res = await request(app).delete(`/badges/${id}`)
             .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(204);
    });
});
