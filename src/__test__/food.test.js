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

describe("Food APIs", () => {

    let adminToken;
    let kitchenToken;
    let foodIdTest;

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

    describe("Create API", () => {

        test('Should Create a food', async () => {

            const response = await request(app)
                .post('/api/food/create')
                .set('Cookie', adminToken)
                .send({category: 'FOOD',name:'TEST FOOD', ingredients:{0:'test0', 1:'test1'}});
    
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("newFood");
            foodIdTest = response.body['newFood']['_id'];
        });
    
        test('Only admin can create a food', async () => {
    
            const response = await request(app)
                .post('/api/food/create')
                .set('Cookie', kitchenToken)
                .send({category: 'FOOD',name:'TEST FOOD', ingredients:{0:'test0', 1:'test1'}});
    
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('error', 'For Creating a food you should be admin' );

    
        });
    
        test('Category should be required', async () => {
    
            const response = await request(app)
                .post('/api/food/create')
                .set('Cookie', adminToken)
                .send({name:'Test Food', ingredients:{0:'test0', 1:'test1'}});
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('error', 'foodSchema validation failed: category: Path `category` is required.' );
    
        });
    
        test('Name should be required', async () => {
    
            const response = await request(app)
                .post('/api/food/create')
                .set('Cookie', adminToken)
                .send({category:'FOOD', ingredients:{0:'test0', 1:'test1'}});
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('error', 'foodSchema validation failed: name: Path `name` is required.' );
    
        });
    });

    describe('Get all API', () => {

        test('should get all Tables', async () => {

            const response = await request(app).get('/api/food/getAll');
    
            expect(response.statusCode).toBe(200);
            expect(response.body["foods"]).toBeInstanceOf(Array);
    
        });
    });

    describe('Change State API', () => {

        test('Should change the state', async () => {

            const response = await request(app)
                .put('/api/food/state')
                .set('Cookie', adminToken)
                .query({foodId: foodIdTest});
    
            expect(response.statusCode).toBe(200);
            expect(response.body["updatedFood"]['state']).toBe('UNAVAILABLE');
    
        });

        test('Kitchen users should change the food state', async () => {

            const response = await request(app)
                .put('/api/food/state')
                .set('Cookie', kitchenToken)
                .query({foodId: foodIdTest});
    
            expect(response.statusCode).toBe(200);
            expect(response.body["updatedFood"]['state']).toBe('AVAILABLE');
    
        });

        test('Admin users should change the food state', async () => {

            const response = await request(app)
                .put('/api/food/state')
                .set('Cookie', adminToken)
                .query({foodId: foodIdTest});
    
            expect(response.statusCode).toBe(200);
            expect(response.body["updatedFood"]['state']).toBe('UNAVAILABLE');
    
        });

        test('Should return an error if food does not exist', async () => {

            const response = await request(app)
                .put('/api/food/state')
                .set('Cookie', adminToken)
                .query({foodId: "65e5ebf1ad795e8a432bea5e"});

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('error', 'Food item not found');
    
        });
    })

    describe('Update API', () =>{

        test('Should update a food', async () => {

            const response = await request(app)
                .put('/api/food/update')
                .set('Cookie', adminToken)
                .send({foodId: foodIdTest, 
                    category: 'FOOD',
                    name: 'Update Food Name', 
                    ingredients:{0:'update0', 1: 'update1'}});
                    
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("updatedFood");
            expect(response.body['updatedFood']['name']).toBe("Update Food Name");

        });

        test('Only admin should update food', async () => {

            const response = await request(app)
                .put('/api/food/update')
                .set('Cookie', kitchenToken)
                .send({foodId: foodIdTest, 
                    category: 'FOOD',
                    name: 'Update Food Name', 
                    ingredients:{0:'update0', 1: 'update1'}});
                    
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", "For updating a food you should be admin");

        });

        test('Should return an error for invalid foodId', async () => {

            const response = await request(app)
                .put('/api/food/update')
                .set('Cookie', adminToken)
                .send({foodId: "65e5ebf1ad795e8a432bea5e", 
                    category: 'FOOD',
                    name: 'Update Food Name', 
                    ingredients:{0:'update0', 1: 'update1'}});
                    
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", "Food item not found");

        }); 
    });

    describe('delete API', () => {

        test('Only admin should have access', async () => {

            const response = await request(app)
                .delete('/api/food/delete')
                .set('Cookie', kitchenToken)
                .query({foodId: foodIdTest});
                    
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", "For deleting a food you should be admin");

        }); 

        test('Should return an error for invalid foodId', async () => {

            const response = await request(app)
                .delete('/api/food/delete')
                .set('Cookie', adminToken)
                .query({foodId: "65e5ebf1ad795e8a432bea5e"});
                    
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("error", "Food not found!");

        }); 

        test('Should delete a food', async () => {

            const response = await request(app)
                .delete('/api/food/delete')
                .set('Cookie', adminToken)
                .query({foodId: foodIdTest});
                    
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Food deleted successfully");

        }); 
    })

    

    

});
