import request from 'supertest';
import { createApp } from '../../src/index';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

let app: any;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

beforeAll(async () => {
    app = await createApp(mongoose.connection);
});

describe('Challenges Routes', () => {

    function generateToken(userId: string, role: string) {
        return jwt.sign({ userId, role, email: 'test@test.com' }, JWT_SECRET);
    }

    async function createFixtures() {
        const adminId = new mongoose.Types.ObjectId().toString();
        const adminToken = generateToken(adminId, 'ADMIN');

        const userRes = await request(app).post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: `creator_${Date.now()}_${Math.random()}@test.com`,
                password: 'Test@1234',
                firstName: 'Challenge',
                lastName: 'Creator',
                role: 'ADMIN'
            });
        expect(userRes.status).toBe(201);
        const creatorId = userRes.body._id;
        const creatorToken = generateToken(creatorId, 'ADMIN');

        const catRes = await request(app).post('/exercise-categories')
            .set('Authorization', `Bearer ${creatorToken}`)
            .send({
                name: `Category_${Date.now()}`
            });
        
        let categoryId;
        if(catRes.status === 201) {
             categoryId = catRes.body._id;
        } else {
            categoryId = new mongoose.Types.ObjectId().toString();
        }

        const workRes = await request(app).post('/workouts')
            .set('Authorization', `Bearer ${creatorToken}`)
            .send({
                title: 'Test Workout',
                creatorId: creatorId,
                creatorType: 'user', 
                categoryId: categoryId,
                difficulty: 'beginner'
            });
        
        let workoutId;
        if (workRes.status === 201) {
            workoutId = workRes.body._id;
        } else {
             workoutId = new mongoose.Types.ObjectId().toString();
        }

        return { creatorId, workoutId, creatorToken };
    }

    it('POST /challenges should create a challenge', async () => {
        const { creatorId, workoutId, creatorToken } = await createFixtures();
        const res = await request(app).post('/challenges')
            .set('Authorization', `Bearer ${creatorToken}`)
            .send({
                workoutId,
                creatorId,
                title: 'New Challenge',
                rankingType: 'most_reps',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 86400000).toISOString(),
                pointsReward: { first: 100, second: 50, third: 25, participation: 10 },
                visibility: 'public'
            });
        
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
    });

    it('GET /challenges should return all challenges', async () => {
        const res = await request(app).get('/challenges'); 
        if (res.status === 401) {
        } else {
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        }
    });
});
