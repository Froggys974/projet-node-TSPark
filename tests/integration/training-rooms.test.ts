import request from 'supertest';
import { createApp } from '../../src/index';
import mongoose from 'mongoose';

let app: any;

beforeAll(async () => {
    app = await createApp(mongoose.connection);
});

describe('TrainingRooms Routes', () => {

    it('POST /training-rooms should create a training room', async () => {
        const res = await request(app).post('/training-rooms').send({
            name: 'Main Room',
            address: '123 Main St',
            ownerId: new mongoose.Types.ObjectId().toString(),
            capacity: 50
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
    });

    it('GET /training-rooms should return all training rooms', async () => {
        const create = await request(app).post('/training-rooms').send({
            name: 'List Room',
            address: '456 List St',
            ownerId: new mongoose.Types.ObjectId().toString(),
            capacity: 30
        });
        const id = create.body._id;

        const res = await request(app).get('/training-rooms');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        const found = res.body.find((r: any) => r._id === id);
        expect(found).toBeDefined();
    });

    it('GET /training-rooms/:id should return a training room by id', async () => {
        const create = await request(app).post('/training-rooms').send({
            name: 'Get Room',
            address: '789 Get St',
            ownerId: new mongoose.Types.ObjectId().toString(),
            capacity: 20
        });
        const id = create.body._id;

        const res = await request(app).get(`/training-rooms/${id}`);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(id);
    });

    it('PUT /training-rooms/:id should update a training room', async () => {
        const create = await request(app).post('/training-rooms').send({
            name: 'Update Room',
            address: '101 Update St',
            ownerId: new mongoose.Types.ObjectId().toString(),
            capacity: 20
        });
        const id = create.body._id;

        const res = await request(app).put(`/training-rooms/${id}`).send({
            name: 'Updated Room'
        });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Updated Room');
    });

    it('DELETE /training-rooms/:id should delete a training room', async () => {
        const create = await request(app).post('/training-rooms').send({
            name: 'Delete Room',
            address: '202 Delete St',
            ownerId: new mongoose.Types.ObjectId().toString(),
            capacity: 20
        });
        const id = create.body._id;

        const res = await request(app).delete(`/training-rooms/${id}`);
        expect(res.status).toBe(204);
    });
});
