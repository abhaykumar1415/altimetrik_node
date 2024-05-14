const request = require('supertest');
const express = require('express');
const userRoutes = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User API', () => {
	let createdUserId;
	let token;

	beforeAll(async () => {
		// Signup a user to get a valid user ID
		const res = await request(app).post('/api/users/signup').send({
			username: 'testuser',
			firstName: 'Test',
			lastName: 'User',
			password: 'password',
			paymentMethod: 'Credit Card',
			address: '123 Test St',
			profilePicture: 'test.png',
		});

		createdUserId = res.body.id;

		// Login to get a valid token
		const loginRes = await request(app).post('/api/users/login').send({
			username: 'testuser',
			password: 'password',
		});

		token = loginRes.body.token;
	});

	it('should create a new user', async () => {
		const res = await request(app).post('/api/users/signup').send({
			username: 'newuser',
			firstName: 'New',
			lastName: 'User',
			password: 'password',
			paymentMethod: 'Credit Card',
			address: '123 New St',
			profilePicture: 'new.png',
		});

		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('message', 'User created successfully');
	});

	it('should not create a user with an existing username', async () => {
		const res = await request(app).post('/api/users/signup').send({
			username: 'testuser',
			firstName: 'Test',
			lastName: 'User',
			password: 'password',
			paymentMethod: 'Credit Card',
			address: '123 Test St',
			profilePicture: 'test.png',
		});

		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('message', 'Username already exists');
	});

	it('should login an existing user', async () => {
		const res = await request(app).post('/api/users/login').send({
			username: 'testuser',
			password: 'password',
		});

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('message', 'Login successful');
		expect(res.body).toHaveProperty('token');
	});

	it('should not login with invalid credentials', async () => {
		const res = await request(app).post('/api/users/login').send({
			username: 'testuser',
			password: 'wrongpassword',
		});

		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('message', 'Invalid username or password');
	});

	it('should get all users', async () => {
		const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeInstanceOf(Array);
	});

	it('should update a user', async () => {
		const res = await request(app).put(`/api/users/${createdUserId}`).set('Authorization', `Bearer ${token}`).send({
			firstName: 'Updated',
			lastName: 'User',
			address: '456 Updated St',
		});

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('message', 'User updated successfully');
	});

	it('should not update a non-existent user', async () => {
		const res = await request(app).put('/api/users/nonexistent').set('Authorization', `Bearer ${token}`).send({
			firstName: 'Updated',
			lastName: 'User',
			address: '456 Updated St',
		});

		expect(res.statusCode).toEqual(404);
		expect(res.body).toHaveProperty('message', 'User not found');
	});
});
