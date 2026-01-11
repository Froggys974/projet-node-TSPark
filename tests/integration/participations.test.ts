import request from 'supertest';
import { createApp } from '../../src/index';
import mongoose from 'mongoose';

let app: any;

beforeAll(async () => {
    app = await createApp(mongoose.connection);
});

describe('Participations Routes', () => {

    async function createFixtures() {
        const userRes = await request(app).post('/users').send({
            name: `partUser_${Date.now()}_${Math.random()}`,
            email: `part_${Date.now()}_${Math.random()}@test.com`,
            password: 'pass'
        });
        expect(userRes.status).toBe(201);
        const challRes = await request(app).post('/challenges').send({
            title: 'Part Challenge',
            description: 'Desc',
            exerciseType: 'cardio',
            targetValue: 100,
            creatorId: new mongoose.Types.ObjectId().toString(),
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000)
        });
        expect(challRes.status).toBe(201);
        const ownerRes = await request(app).post('/gym-owners').send({
            name: 'PartOwner', // Simplified name to avoid random issues if any
            email: `partowner_${Date.now()}_${Math.random()}@test.com`,
            password: 'pass'
        });
        expect(ownerRes.status).toBe(201);
        return { userId: userRes.body._id, challengeId: challRes.body._id, gymOwnerId: ownerRes.body._id };
    }

    it('POST /participations should create a participation', async () => {
        const { userId, challengeId, gymOwnerId } = await createFixtures();
        const res = await request(app).post('/participations').send({
            user: userId,
            challengeId,
            gymOwner: gymOwnerId,
            startDate: new Date().toISOString(),
            status: 'in_progress'
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
    });

    it('GET /participations should return all participations', async () => {
        const { userId, challengeId, gymOwnerId } = await createFixtures();
        await request(app).post('/participations').send({
            user: userId, challengeId, gymOwner: gymOwnerId, startDate: new Date().toISOString(), status: 'in_progress'
        });
        
        const res = await request(app).get('/participations');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /participations/:id should return a participation by id', async () => {
        const { userId, challengeId, gymOwnerId } = await createFixtures();
        const create = await request(app).post('/participations').send({
            user: userId, challengeId, gymOwner: gymOwnerId, startDate: new Date().toISOString(), status: 'in_progress'
        });
        const participationId = create.body._id;

        const res = await request(app).get(`/participations/${participationId}`);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(participationId);
    });

    it('PUT /participations/:id should update a participation', async () => {
        const { userId, challengeId, gymOwnerId } = await createFixtures();
        const create = await request(app).post('/participations').send({
            user: userId, challengeId, gymOwner: gymOwnerId, startDate: new Date().toISOString(), status: 'in_progress'
        });
        const participationId = create.body._id;

        const res = await request(app).put(`/participations/${participationId}`).send({
            status: 'completed' 
        });
        expect([200, 204]).toContain(res.status); 
    });

    it('DELETE /participations/:id should delete a participation', async () => {
        const { userId, challengeId, gymOwnerId } = await createFixtures();
        const create = await request(app).post('/participations').send({
            user: userId, challengeId, gymOwner: gymOwnerId, startDate: new Date().toISOString(), status: 'in_progress'
        });
        const participationId = create.body._id;

        const res = await request(app).delete(`/participations/${participationId}`);
        expect(res.status).toBe(204);
    });
});
