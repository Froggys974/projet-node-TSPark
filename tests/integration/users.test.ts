import request from 'supertest';
import { createApp } from '../../src/index';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

let app: any;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

beforeAll(async () => {
    app = await createApp(mongoose.connection);
});

describe('Users Routes (Admin Protected)', () => {

    function generateToken(userId: string, role: string) {
        return jwt.sign({ userId, role, email: 'admin@test.com' }, JWT_SECRET);
    }
    
    // Simulate an Admin who has rights to all these routes
    const adminId = new mongoose.Types.ObjectId().toString();
    const adminToken = generateToken(adminId, 'ADMIN');

    it('POST /users should create a user (Admin only)', async () => {
        const res = await request(app).post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'testuser',
                lastName: 'test',
                email: `test_${Date.now()}@example.com`, // Ensure unique
                password: 'Test@1234',
                role: 'USER'
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.firstName).toBe('testuser');
    });

    it('GET /users should return all users', async () => {
        // Create one first
        await request(app).post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'ListUser',
                lastName: 'Test',
                email: `list_${Date.now()}@example.com`,
                password: 'Test@1234',
                role: 'USER'
            });

        const res = await request(app).get('/users')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /users/:id should return a user by id', async () => {
        const create = await request(app).post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'GetUser',
                lastName: 'Test',
                email: `get_${Date.now()}@test.com`,
                password: 'Test@1234',
                role: 'USER'
            });
        const id = create.body._id;

        const res = await request(app).get(`/users/${id}`)
             .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(id);
    });

    it('PUT /users/:id should update a user', async () => {
        const create = await request(app).post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'UpdateUser',
                lastName: 'Test',
                email: `update_${Date.now()}@test.com`,
                password: 'Test@1234',
                role: 'USER'
            });
        const id = create.body._id;

        const res = await request(app).put(`/users/${id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'UpdatedUser'
            });
        expect(res.status).toBe(200);
        expect(res.body.firstName).toBe('UpdatedUser');
    });

    it('DELETE /users/:id should delete a user', async () => {
        const create = await request(app).post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'DeleteUser',
                lastName: 'Test',
                email: `del_${Date.now()}@test.com`,
                password: 'Test@1234',
                role: 'USER'
            });
        const id = create.body._id;

        const res = await request(app).delete(`/users/${id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(204);
    });

    it('GET /users/:id should return 404 for deleted user', async () => {
        const create = await request(app).post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'DelCheck',
                lastName: 'Test',
                email: `del2_${Date.now()}@test.com`,
                password: 'Test@1234',
                role: 'USER'
            });
        const id = create.body._id;
        await request(app).delete(`/users/${id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        const res = await request(app).get(`/users/${id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(404);
    });
});
