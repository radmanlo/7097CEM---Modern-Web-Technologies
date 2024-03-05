const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../app');
const userSchema = require('../model/user');
const tableSchema = require("../model/table");

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

describe('Table APIs', () => {

    let adminToken;
    let welcomeToken;

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
            name: 'Welcome User',
            email: 'welcome@example.com',
            password: 'password',
            role: 'WELCOME'
        };

        const user = new userSchema(userData);    
        await user.save();
  
        // Then, sign in with the created user
        const welcomeResponse = await request(app)
            .post('/api/auth/signin')
            .send({ email: 'welcome@example.com', password: 'password' });

        expect(welcomeResponse.status).toBe(200);
        expect(welcomeResponse.body).toHaveProperty('name', 'Welcome User');
        welcomeToken = welcomeResponse.headers['set-cookie'][0];


    });

    describe("Create API", () => {

        test('Should Create a table', async () => {

            const response = await request(app)
                .post('/api/table/create')
                .set('Cookie', adminToken)
                .query({ number: 1, capacity: 4 });
    
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("message", "Table created!");
    
        });

        test('Only admin can create a table', async () => {

            const response = await request(app)
                .post('/api/table/create')
                .set('Cookie', welcomeToken)
                .query({ number: 2, capacity: 4 });
    
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", 'For Creating a table you should be admin');
    
        });

        test('Table numbers should be unique', async () => {

            const response = await request(app)
                .post('/api/table/create')
                .set('Cookie', adminToken)
                .query({ number: 1, capacity: 4 });
    
            
            expect(response.statusCode).toBe(409);
    
        });

    })

    describe('Get all API', () => {

        test('should get all Tables', async () => {

            const response = await request(app)
                .get('/api/table/getAll')
                .set('Cookie', welcomeToken);
    
            expect(response.statusCode).toBe(200);
            expect(response.body["tables"]).toBeInstanceOf(Array);
    
        });

        test('only server and welcone staff can get all Tables', async () => {

            const response = await request(app)
                .get('/api/table/getAll')
                .set('Cookie', adminToken);
    
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", 'For getting tables you should be Welcome or Server staff');
    
        });

    })
  
    describe('Update state API', () =>{

        test('Should change the table state', async () => {

            const response = await request(app)
                .put('/api/table/state')
                .set('Cookie', welcomeToken)
                .query({ number: 1 });
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', 'Table state updated successfully');
    
        });

        test('Only server and welcome staff can change the state of table', async () => {

            const response = await request(app)
                .put('/api/table/state')
                .set('Cookie', adminToken)
                .query({ number: 1 });
    
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", 'For changing the state of a table you should be server, Welcome or admin staff');
    
        });

    })

    describe('Make empty API', () => {

        test('Should make the state of table empty', async () => {

            const response = await request(app)
                .put('/api/table/empty')
                .set('Cookie', welcomeToken)
                .query({ number: 1 });
        
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', 'Table state updated successfully');
    
        });

        test('Only server and welcome staffs can do', async () => {

            const response = await request(app)
                .put('/api/table/empty')
                .set('Cookie', adminToken)
                .query({ number: 1 });
        
                expect(response.statusCode).toBe(404);
                expect(response.body).toHaveProperty("error", 'For emptying a table you should be Welcome or admin staff');
    
        });

    })
  
    describe('Delete API', () => {
        
        test('Delete Table', async () => {

            const response = await request(app)
                .delete('/api/table/delete')
                .set('Cookie', adminToken)
                .query({ number: 1 });
        
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', 'Table deleted successfully');
    
        });

        test('Only admin can delete a table', async () => {

            const response = await request(app)
                .delete('/api/table/delete')
                .set('Cookie', welcomeToken)
                .query({ number: 1 });
        
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('error', 'For emptying a table you should be a admin staff');
    
        });
    })
    
  
    


});