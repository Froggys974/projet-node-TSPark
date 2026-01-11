import mongoose from 'mongoose';
import { openMongooseConnection } from '../../src/services/mongoose/utils';

beforeAll(async () => {
    // Only run this setup for integration tests
    const testPath = expect.getState().testPath;
    if (!testPath || !testPath.includes('tests\\integration') && !testPath.includes('tests/integration')) {
        return;
    }

    // Explicit environment variables for test connection
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017";
    process.env.MONGODB_USER = "root";
    process.env.MONGODB_PASSWORD = "kjnsfjnmejn";
    process.env.MONGODB_DATABASE = "test_db";
    
    // Legacy support if needed
    process.env.MONGO_URI_TEST = "mongodb://root:kjnsfjnmejn@127.0.0.1:27017/test_db?authSource=admin";

    await openMongooseConnection();
});

afterAll(async () => {
    await mongoose.connection.close();
});

afterEach(async () => {
    // Clear collections after each test to ensure isolation
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});
