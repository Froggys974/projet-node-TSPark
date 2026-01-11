import request from 'supertest';
import { createApp } from '../../src/index';
import mongoose from 'mongoose';

let app: any;

beforeAll(async () => {
    app = await createApp(mongoose.connection);
});

describe('GymOwners Routes', () => {

    it('POST /gym-owners should create a gym owner', async () => {
        const res = await request(app).post('/gym-owners').send({
            name: 'gymowner',
            email: 'owner@example.com',
            password: 'password123'
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
    });

    it('GET /gym-owners should return all gym owners', async () => {
        const create = await request(app).post('/gym-owners').send({
            name: 'listOwner',
            email: 'listowner@example.com',
            password: 'pass'
        });
        expect(create.status).toBe(201);
        const id = create.body._id;

        const res = await request(app).get('/gym-owners');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        const found = res.body.find((o: any) => o._id === id);
        expect(found).toBeDefined();
    });

    it('GET /gym-owners/:id should return a gym owner by id', async () => {
        const create = await request(app).post('/gym-owners').send({
            name: 'getOwner',
            email: 'getowner@example.com',
            password: 'pass'
        });
        const id = create.body._id;

        const res = await request(app).get(`/gym-owners/${id}`);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(id);
    });

    it('PUT /gym-owners/:id should update a gym owner', async () => {
        const create = await request(app).post('/gym-owners').send({
            name: 'updateOwner',
            email: 'updateowner@example.com',
            password: 'pass'
        });
        const id = create.body._id;

        const res = await request(app).put(`/gym-owners/${id}`).send({
            name: 'updatedOwner'
        });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('updatedOwner');
    });

    it('DELETE /gym-owners/:id should delete a gym owner', async () => {
        const create = await request(app).post('/gym-owners').send({
            name: 'delOwner',
            email: 'delowner@example.com',
            password: 'pass'
        });
        const id = create.body._id;

        const res = await request(app).delete(`/gym-owners/${id}`);
        expect(res.status).toBe(204);
    });
});
