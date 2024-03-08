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


describe("Order APIs", () => {

    let adminToken;
    let serverToken;
    let kitchenToken;
    let welcomeToken;
    let foodIdTest;
    let orderIdTest;
    let orderIdTest2;

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


    beforeAll(async () => {

        // Save the user to the test database
        const userData = {
            name: 'Server User',
            email: 'server@example.com',
            password: 'password',
            role: 'SERVER'
        };

        const user = new userSchema(userData);    
        await user.save();
  
        // Then, sign in with the created user
        const serverResponse = await request(app)
            .post('/api/auth/signin')
            .send({ email: 'server@example.com', password: 'password' });

        expect(serverResponse.status).toBe(200);
        expect(serverResponse.body).toHaveProperty('name', 'Server User');
        serverToken = serverResponse.headers['set-cookie'][0];

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
        const kitchenResponse = await request(app)
            .post('/api/auth/signin')
            .send({ email: 'kitchen@example.com', password: 'password' });

        expect(kitchenResponse.status).toBe(200);
        expect(kitchenResponse.body).toHaveProperty('name', 'Kitchen User');
        kitchenToken = kitchenResponse.headers['set-cookie'][0];

    });

    beforeAll(async () => {
        const response = await request(app)
            .post('/api/food/create')
            .set('Cookie', adminToken)
            .send({category: 'FOOD',name:'TEST FOOD', ingredients:{0:'test0', 1:'test1'}});
    
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("newFood");
        foodIdTest = response.body['newFood']['_id'];
    });


    describe("Create API", () => {

        test('Should Create an order', async () => {

            const response = await request(app)
                .post('/api/order/create')
                .set('Cookie', serverToken)
                .send({ table_number: 1,  order_items: {foodId: foodIdTest, count: 2}});

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("newOrder");
            expect(response.body['newOrder']).toHaveProperty("order_items");
            expect(response.body['newOrder']['order_items']).toBeInstanceOf(Array);
            expect(response.body['newOrder']['order_items'][0]['foodId']).toBe(foodIdTest);
            orderIdTest = response.body['newOrder']['_id'];

        });

        test('Only Server staff should have access ', async () => {

            const response = await request(app)
                .post('/api/order/create')
                .set('Cookie', kitchenToken)
                .send({ table_number: 1,  order_items: {foodId: foodIdTest, count: 2}});
                
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", 'For Creating a Order you should be server');

        });

        test('validation for table_number ', async () => {

            const response = await request(app)
                .post('/api/order/create')
                .set('Cookie', serverToken)
                .send({ order_items: {foodId: foodIdTest, count: 2}});
                
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("error", "orderSchema validation failed: table_number: Path `table_number` is required.");

        });

    });

    describe('Get by table number API', () => {
        
        test('Should get an order', async () => {

            const response = await request(app)
                .get('/api/order/get/table')
                .set('Cookie', serverToken)
                .query({tableNumber: 1});

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("table_number");
            expect(response.body['table_number']).toBe(1);

        });

        test('Should get an order for a table number', async () => {

            const response = await request(app)
                .get('/api/order/get/table')
                .set('Cookie', serverToken)
                .query({tableNumber: 1});

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("table_number");
            expect(response.body['table_number']).toBe(1);

        });

        test('Only server staffs have access to this api', async () => {

            const response = await request(app)
                .get('/api/order/get/table')
                .set('Cookie', kitchenToken)
                .query({tableNumber: 1});

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", "For getting based on table you should be server");

        });

        test('Should return error for invalid table number', async () => {

            const response = await request(app)
                .get('/api/order/get/table')
                .set('Cookie', serverToken)
                .query({tableNumber: 2});

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", "No orders found for the specified table number.");

        });
    });

    describe("Get orders by state!", () =>{
        
        test('Should get an order', async () => {

            const response = await request(app)
                .get('/api/order/get/state')
                .set('Cookie', kitchenToken)
                .query({state: "PENDING"});

            expect(response.statusCode).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body[0]).toHaveProperty("state");
            expect(response.body[0]["state"]).toBe("PENDING");

        });

        test('Only kitchen staff have access', async () => {

            const response = await request(app)
                .get('/api/order/get/state')
                .set('Cookie', serverToken)
                .query({state: "PENDING"});

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", "For getting based on state you should be kitchen");

        });

        test('Should return empty array for unspecified state', async () => {

            const response = await request(app)
                .get('/api/order/get/state')
                .set('Cookie', kitchenToken)
                .query({state: "TEST"});

            expect(response.statusCode).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBe(0);

        });

    });

    describe("Change State API", () => {

        test('Should change the state of order', async () => {

            const response = await request(app)
                .put('/api/order/update')
                .set('Cookie', kitchenToken)
                .query({orderId: orderIdTest});

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("updatedOrder");
            expect(response.body["updatedOrder"]["state"]).toBe("PREPERING");

        });

        test('Only kitchen staff can update the order status', async () => {

            const response = await request(app)
                .put('/api/order/update')
                .set('Cookie', serverToken)
                .query({orderId: orderIdTest});

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", "For getting based on state you should be kitchen");

        });

        test('Should return error for invalid order Id', async () => {

            const response = await request(app)
                .put('/api/order/update')
                .set('Cookie', kitchenToken)
                .query({orderId: "65e5ebf1ad795e8a432bea5e"});

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", "No orders found");

        });

    });

    describe("Cancel Order API", () => {

        beforeAll(async () => {
            const response = await request(app)
                .post('/api/order/create')
                .set('Cookie', serverToken)
                .send({ table_number: 1,  order_items: {foodId: foodIdTest, count: 2}});

            expect(response.statusCode).toBe(201);
            orderIdTest2 = response.body['newOrder']['_id'];

        });

        test('Should change the state of an order to cancel', async () => {

            const response = await request(app)
                .put('/api/order/cancel')
                .set('Cookie', serverToken)
                .query({orderId: orderIdTest2});

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("updatedOrder");
            expect(response.body["updatedOrder"]["state"]).toBe("CANCELED");

        });

        test('Only server staff can cancel order', async () => {

            const response = await request(app)
                .put('/api/order/cancel')
                .set('Cookie', welcomeToken)
                .query({orderId: orderIdTest2});

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", "For getting based on state you should be server");

        });

        test('Should return an error for invalid order Id', async () => {

            const response = await request(app)
                .put('/api/order/cancel')
                .set('Cookie', serverToken)
                .query({orderId: "65e5ebf1ad795e8a432bea5e"});

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error", "No orders found");

        });

        test('For cancelation order should be in PENDING State, otherwise should return an error!', async () => {

            const response = await request(app)
                .put('/api/order/cancel')
                .set('Cookie', serverToken)
                .query({orderId: orderIdTest2});

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("error", "Too late for cancelation your food is getting ready");

        });

    });

})