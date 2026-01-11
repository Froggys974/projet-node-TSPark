import request from 'supertest';
import { createApp } from '../../src/index';
import mongoose from 'mongoose';

let app: any;

beforeAll(async () => {
    app = await createApp(mongoose.connection);
});

describe('Users Routes', () => {

    it('POST /users should create a user', async () => {
        const res = await request(app).post('/users').send({
            name: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.name).toBe('testuser');
    });

    it('GET /users should return all users', async () => {
        const create = await request(app).post('/users').send({
            name: 'listUser',
            email: 'list@example.com',
            password: 'password123'
        });
        const id = create.body._id;

        const res = await request(app).get('/users');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        const found = res.body.find((u: any) => u._id === id);
        expect(found).toBeDefined();
    });

    it('GET /users/:id should return a user by id', async () => {
        const create = await request(app).post('/users').send({
            name: `user_${Date.now()}`,
            email: `user_${Date.now()}@test.com`,
            password: 'password123'
        });
        const id = create.body._id;

        const res = await request(app).get(`/users/${id}`);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(id);
    });

    it('PUT /users/:id should update a user', async () => {
        const create = await request(app).post('/users').send({
            name: `userToUpdate_${Date.now()}`,
            email: `update_${Date.now()}@test.com`,
            password: 'password123'
        });
        const id = create.body._id;

        const res = await request(app).put(`/users/${id}`).send({
            name: 'updatedUser'
        });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('updatedUser');
    });

    it('GET /users/:id/participations should return participations', async () => {
        const create = await request(app).post('/users').send({
            name: `userPart_${Date.now()}`,
            email: `part_${Date.now()}@test.com`,
            password: 'password123'
        });
        const id = create.body._id;

        const res = await request(app).get(`/users/${id}/participations`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('DELETE /users/:id should delete a user', async () => {
        const create = await request(app).post('/users').send({
            name: `userDel_${Date.now()}`,
            email: `del_${Date.now()}@test.com`,
            password: 'password123'
        });
        const id = create.body._id;

        const res = await request(app).delete(`/users/${id}`);
        expect(res.status).toBe(204);
    });

    it('GET /users/:id should return 404 for deleted user', async () => {
        const create = await request(app).post('/users').send({
            name: `userDel2_${Date.now()}`,
            email: `del2_${Date.now()}@test.com`,
            password: 'password123'
        });
        const id = create.body._id;
        await request(app).delete(`/users/${id}`);

        const res = await request(app).get(`/users/${id}`);
        expect(res.status).toBe(404);
    });
});
