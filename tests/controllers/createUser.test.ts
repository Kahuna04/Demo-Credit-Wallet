import request from 'supertest';
import express from 'express';
import axios from 'axios';
import { createUser } from '../../src/controllers/userController';
import { Schema } from '../../src/config/knexfile';

// Mock the Schema instance
jest.mock('../../src/config/knexfile', () => ({
  Schema: {
    insert: jest.fn(),
    where: jest.fn(),
  },
}));

// Mock axios
jest.mock('axios');

let schemaInstance: any;

beforeAll(async () => {
  schemaInstance = Schema;
});

const app = express();
app.use(express.json());
app.post('/create-user', createUser);

describe('POST /create-user', () => {
  it('should create a user successfully', async () => {
    (schemaInstance.insert as jest.Mock).mockResolvedValue([1]);
    (schemaInstance.where as jest.Mock).mockResolvedValue({
      Id: 1,
      Firstname: 'Dami',
      Lastname: 'Lare',
      Username: 'kahuna',
      PhoneNumber: '08012345678',
      Balance: 0.0,
    });

    const response = await request(app)
      .post('/create-user')
      .send({
        Firstname: 'Dami',
        Lastname: 'Lare',
        Username: 'kahuna',
        PhoneNumber: '08012345678',
        Password: 'password123',
      });

    expect(response.status).toBe(201);
    expect(response.body.successful).toBe(true);
    expect(response.body.message).toBe('Account created successfully');
  });

  it('should return 400 if user is blacklisted', async () => {
    // Mock the karma API response to indicate the user is blacklisted
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: {
        karma_identity: true, 
      },
    });

    const response = await request(app)
      .post('/create-user')
      .send({
        Firstname: 'Dami',
        Lastname: 'Lare',
        Username: 'kahuna',
        PhoneNumber: '08012345678',
        Password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body.successful).toBe(false);
    expect(response.body.message).toBe('User is blacklisted and cannot be onboarded');
  });

  it('should return 500 if an error occurs', async () => {
    (schemaInstance.insert as jest.Mock).mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/create-user')
      .send({
        Firstname: 'Dami',
        Lastname: 'Lare',
        Username: 'kahuna',
        PhoneNumber: '08012345678',
        Password: 'password123',
      });

    expect(response.status).toBe(500);
  });
});
