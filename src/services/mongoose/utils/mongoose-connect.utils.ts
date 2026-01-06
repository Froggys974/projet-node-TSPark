import { connect, Mongoose } from "mongoose";

export async function openMongooseConnection(): Promise<Mongoose> {
    if (typeof process.env.MONGODB_URI === 'undefined') {
        throw new Error("MONGODB_URI is not defined in environment variables");
    }
    if (typeof process.env.MONGODB_USER === 'undefined') {
        throw new Error("MONGODB_USER is not defined in environment variables");
    }
    if (typeof process.env.MONGODB_PASSWORD === 'undefined') {
        throw new Error("MONGODB_PASSWORD is not defined in environment variables");
    }
    if (typeof process.env.MONGODB_DATABASE === 'undefined') {
        throw new Error("MONGODB_DATABASE is not defined in environment variables");
    }
    return connect(process.env.MONGODB_URI, {
        auth: {
            username: process.env.MONGODB_USER,
            password: process.env.MONGODB_PASSWORD
        },
        authSource: "admin",
        dbName: process.env.MONGODB_DATABASE
    });
}