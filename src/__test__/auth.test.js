const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../app');
const userSchema = require('../model/user');

// Create a new MongoMemoryServer
const mongod = new MongoMemoryServer();

// Establish a connection to the in-memory database
beforeAll(async () => {
  await mongod.start();
  const uri = await mongod.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Clear the database and close the connection
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

describe('POST /signup', () => {

  test('should create a new user', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password' });
      
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', 'test@example.com');
    // Add more assertions as needed
  });
  
  test('should return error for creating a user who already existed', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password' });
      
    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error', "email already registered");
  });

  test('should return a validation error if name is missing', async () => {

    const response = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'password' });
      
    expect(response.status).toBe(409);
  });



});

describe('POST /signin', () => {

  test('should sign in an existing user', async () => {

    // Save the user to the test database
    const userData = {
      name: 'Test User',
      email: 'signinTest@example.com',
      password: 'password',
      role: 'ADMIN'
    };
    const user = new userSchema(userData);    
    await user.save();

    // Then, sign in with the created user
    const response = await request(app)
      .post('/api/auth/signin')
      .send({ email: 'signinTest@example.com', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', 'Test User');

  });

  test('Should return error for a user without role', async () => {

    // Then, sign in with the created user
    const response = await request(app)
      .post('/api/auth/signin')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(400);
    
  });
  
});