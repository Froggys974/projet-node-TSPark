import request from 'supertest';
import { createApp } from '../../src/index';
import mongoose from 'mongoose';

let app: any;

beforeAll(async () => {
    app = await createApp(mongoose.connection);
});

describe('Challenges Routes', () => {

    it('POST /challenges should create a challenge', async () => {
        const res = await request(app).post('/challenges').send({
            title: 'Pushup Challenge',
            description: 'Do 100 pushups',
            exerciseType: 'strength',
            targetValue: 100,
            creatorId: new mongoose.Types.ObjectId().toString(),
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000)
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
    });

    it('GET /challenges should return all challenges', async () => {
        const create = await request(app).post('/challenges').send({
            title: 'List Challenge',
            description: 'Desc',
            exerciseType: 'strength',
            targetValue: 50,
            creatorId: new mongoose.Types.ObjectId().toString(),
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000)
        });
        const id = create.body._id;

        const res = await request(app).get('/challenges');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        const found = res.body.find((c: any) => c._id === id);
        expect(found).toBeDefined();
    });

    it('GET /challenges/:id should return a challenge by id', async () => {
        const create = await request(app).post('/challenges').send({
            title: 'Get Challenge',
            description: 'Desc',
            exerciseType: 'strength',
            targetValue: 50,
            creatorId: new mongoose.Types.ObjectId().toString(),
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000)
        });
        const id = create.body._id;

        const res = await request(app).get(`/challenges/${id}`);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(id);
    });

    it('PUT /challenges/:id should update a challenge', async () => {
        const create = await request(app).post('/challenges').send({
            title: 'Update Challenge',
            description: 'Desc',
            exerciseType: 'strength',
            targetValue: 50,
            creatorId: new mongoose.Types.ObjectId().toString(),
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000)
        });
        const id = create.body._id;

        const res = await request(app).put(`/challenges/${id}`).send({
            title: 'Updated Challenge'
        });
        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Updated Challenge');
    });

    it('DELETE /challenges/:id should delete a challenge', async () => {
        const create = await request(app).post('/challenges').send({
            title: 'Delete Challenge',
            description: 'Desc',
            exerciseType: 'strength',
            targetValue: 50,
            creatorId: new mongoose.Types.ObjectId().toString(),
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000)
        });
        const id = create.body._id;

        const res = await request(app).delete(`/challenges/${id}`);
        expect(res.status).toBe(204);
    });
});
