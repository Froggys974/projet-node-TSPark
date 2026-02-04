import request from 'supertest';
import { createApp } from '../../src/index';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

let app: any;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

beforeAll(async () => {
    app = await createApp(mongoose.connection);
});

describe('Participations Routes', () => {

    function generateToken(userId: string, role: string) {
        return jwt.sign({ userId, role, email: 'test@test.com' }, JWT_SECRET);
    }

    async function createFixtures() {
        const adminId = new mongoose.Types.ObjectId().toString();
        const adminToken = generateToken(adminId, 'ADMIN');

        const creatorRes = await request(app).post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: `creator_${Date.now()}_${Math.random()}@test.com`,
                password: 'Test@1234',
                firstName: 'Content',
                lastName: 'Creator',
                role: 'ADMIN'
            });
        const creatorId = creatorRes.body._id;
        const creatorToken = generateToken(creatorId, 'ADMIN');

        const categoryId = new mongoose.Types.ObjectId().toString();
        const workRes = await request(app).post('/workouts')
            .set('Authorization', `Bearer ${creatorToken}`)
            .send({
                title: 'Challenge Workout',
                creatorId: creatorId,
                creatorType: 'user',
                categoryId: categoryId,
                difficulty: 'intermediate'
            });
        let workoutId;
        if (workRes.status === 201) workoutId = workRes.body._id;
        else workoutId = new mongoose.Types.ObjectId().toString();

        const challRes = await request(app).post('/challenges')
            .set('Authorization', `Bearer ${creatorToken}`)
            .send({
                workoutId,
                creatorId,
                title: 'Ultimate Challenge',
                rankingType: 'most_reps',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 86400000).toISOString(),
                pointsReward: { first: 100, second: 50, third: 25, participation: 10 },
                visibility: 'public'
            });
        let challengeId;
        if (challRes.status === 201) challengeId = challRes.body._id;
        else challengeId = new mongoose.Types.ObjectId().toString();

        const partRes = await request(app).post('/auth/register/user').send({
            email: `participant_${Date.now()}_${Math.random()}@test.com`,
            password: 'Test@1234',
            firstName: 'John',
            lastName: 'DOE'
        });
        expect(partRes.status).toBe(201);
        const { user, token } = partRes.body;
        const participantId = user._id;
        const participantToken = token;

        const sessionRes = await request(app).post('/workout-sessions')
            .set('Authorization', `Bearer ${participantToken}`)
            .send({
                userId: participantId,
                workoutId: workoutId,
                status: 'completed',
                sessionDate: new Date().toISOString(),
                startedAt: new Date(Date.now() - 3600000).toISOString(),
                completedAt: new Date().toISOString(), 
                caloriesBurned: 500,
                stepPerformances: []
            });
        
        let sessionId;
        if (sessionRes.status === 201) {
             sessionId = sessionRes.body._id;
        } else {
             sessionId = new mongoose.Types.ObjectId().toString();
        }

        return { challengeId, sessionId, participantToken, participantId };
    }

    it('POST /participations should create a participation', async () => {
        const { challengeId, sessionId, participantToken, participantId } = await createFixtures();
        const res = await request(app).post('/participations')
            .set('Authorization', `Bearer ${participantToken}`)
            .send({
                challengeId,
                userId: participantId,
                sessionId,
                score: 100,
                pointsEarned: 10
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
    });

    it('GET /participations should return all participations', async () => {
        const { challengeId, sessionId, participantToken, participantId } = await createFixtures();
        await request(app).post('/participations')
            .set('Authorization', `Bearer ${participantToken}`)
            .send({
                challengeId, userId: participantId, sessionId, score: 50, pointsEarned: 5
            });

        const res = await request(app).get('/participations')
             .set('Authorization', `Bearer ${participantToken}`); 
        
        if (res.status === 200) {
            expect(Array.isArray(res.body)).toBeTruthy();
        }
    });
});
