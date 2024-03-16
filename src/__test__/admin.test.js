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

describe('Admin APIs', () => {

    let adminToken;
    let kitchenToken;

    beforeAll(async () => {

        // Save the user to the test database
        const userData = {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password',
            role: 'ADMIN'
        };
        const user = new userSchema(userData);    
        await user.save();
  
        // Then, sign in with the created user
        const adminResponse = await request(app)
            .post('/api/auth/signin')
            .send({ email: 'admin@example.com', password: 'password' });

        expect(adminResponse.status).toBe(200);
        expect(adminResponse.body).toHaveProperty('name', 'Admin User');
        adminToken = adminResponse.headers['set-cookie'][0];
    });

    beforeAll(async () => {

        // Save the user to the test database
        const userData = {
            name: 'Kitchen User',
            email: 'kitchen@example.com',
            password: 'password',
            role: 'KITCHEN'
        };

        const user = new userSchema(userData);    
        await user.save();
  
        // Then, sign in with the created user
        const welcomeResponse = await request(app)
            .post('/api/auth/signin')
            .send({ email: 'kitchen@example.com', password: 'password' });

        expect(welcomeResponse.status).toBe(200);
        expect(welcomeResponse.body).toHaveProperty('name', 'Kitchen User');
        kitchenToken = welcomeResponse.headers['set-cookie'][0];

    });

    describe('PUT /changeRole', () => {

        beforeAll(async ()=>{
            const response = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'Test User', email: 'test@example.com', password: 'password' });
      
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('email', 'test@example.com');
        });


        test('Should Update the role of a user', async () => {

            const response = await request(app)
                .put('/api/admin/changeRole')
                .set('Cookie', adminToken)
                .send({email: 'test@example.com', name: "SERVER"});
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "User role updated successfully");
        });

        test('Only admin should Have access to the API', async () => {

            const response = await request(app)
                .put('/api/admin/changeRole')
                .set('Cookie', kitchenToken)
                .send({email: 'test@example.com', name: "SERVER"});
    
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", 'For changing user roll you should be admin');

        });

        test('Should return error for invalid email', async () =>{
            const response = await request(app)
                .put('/api/admin/changeRole')
                .set('Cookie', adminToken)
                .send({email: 'invalid@example.com', name: "SERVER"});

            expect(response.statusCode).toBe(409);
            expect(response.body).toHaveProperty("error", 'Invalid email');
        });
    })

    describe("GET /users", () =>{

        test('Should get users', async () => {

            const response = await request(app)
                .get('/api/admin/users')
                .set('Cookie', adminToken);
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('found_users')
            expect(response.body['found_users']).toBeInstanceOf(Array);
        });

        test('Only admin should Have access to the API', async () => {

            const response = await request(app)
                .get('/api/admin/users')
                .set('Cookie', kitchenToken);
    
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", 'For getting users you should be admin');

        });
    })

    describe("DELETE /delete", () => {
        
        test('Only admin should Have access to the API', async () => {

            const response = await request(app)
                .delete('/api/admin/delete')
                .set('Cookie', kitchenToken)
                .query({email: "test@example.com"});
    
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", 'For deleting a user you should be admin');

        });

        test('Should return error for invalid email', async () =>{
            const response = await request(app)
                .delete('/api/admin/delete')
                .set('Cookie', adminToken)
                .query({email: 'invalid@example.com'});

            expect(response.statusCode).toBe(409);
            expect(response.body).toHaveProperty("error", 'Invalid email');
        })

        test('Should delete a user', async () => {

            const response = await request(app)
                .delete('/api/admin/delete')
                .set('Cookie', adminToken)
                .query({email: 'test@example.com'});
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', "Deleted Successfully!");

        });

    });
})