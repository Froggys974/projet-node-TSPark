import request from 'supertest';
import { createApp } from '../../src/index';
import mongoose from 'mongoose';

let app: any;

beforeAll(async () => {
    app = await createApp(mongoose.connection);
});

describe('Badges Routes', () => {

    it('POST /badges should create a badge', async () => {
        const res = await request(app).post('/badges').send({
            name: 'Gold Medal',
            description: 'Awarded for excellence',
            points: 100,
            requirement: 'total_score >= 100'
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
    });

    it('GET /badges should return all badges', async () => {
        await request(app).post('/badges').send({ 
            name: 'List Badge', 
            points: 10,
            description: 'Desc',
            requirement: 'total_score >= 10'
        });
        const res = await request(app).get('/badges');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /badges/:id should return a badge by id', async () => {
        const create = await request(app).post('/badges').send({ 
            name: 'Get Badge', 
            points: 10,
            description: 'Desc',
            requirement: 'total_score >= 10'
        });
        const id = create.body._id;

        const res = await request(app).get(`/badges/${id}`);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(id);
    });

    it('PUT /badges/:id should update a badge', async () => {
        const create = await request(app).post('/badges').send({ 
            name: 'Update Badge', 
            points: 10,
            description: 'Desc',
            requirement: 'total_score >= 10'
        });
        const id = create.body._id;

        const res = await request(app).put(`/badges/${id}`).send({
            name: 'Updated Name'
        });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Updated Name');
    });

    it('DELETE /badges/:id should delete a badge', async () => {
        const create = await request(app).post('/badges').send({ 
            name: 'Delete Badge', 
            points: 10,
            description: 'Desc',
            requirement: 'total_score >= 10'
        });
        const id = create.body._id;

        const res = await request(app).delete(`/badges/${id}`);
        expect(res.status).toBe(204);
    });
});
