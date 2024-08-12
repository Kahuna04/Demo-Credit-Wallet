import request from 'supertest';
import express from 'express';
import { login } from '../../src/controllers/userController';
import { Schema } from '../../src/config/knexfile';
import jwt from 'jsonwebtoken';

let schemaInstance: any;

jest.mock('jsonwebtoken');
jest.mock('../../src/config/knexfile', () => ({
  Schema: {
    where: jest.fn(),
  },
}));

beforeAll(async () => {
  schemaInstance = await Schema;
});

const app = express();
app.use(express.json());
app.post('/login', login);

describe('POST /login', () => {
  it('should log in a user successfully', async () => {
    const mockUser = { 
      Username: 'kahuna', 
      Password: 'password123', 
      PhoneNumber: '08012345678', 
      AccountNo: '8012345678' 
    };

    (schemaInstance.where as jest.Mock).mockResolvedValueOnce([mockUser]);
    (jwt.sign as jest.Mock).mockReturnValue('mock-token');

    const response = await request(app)
      .post('/login')
      .send({
        Username: 'kahuna',
        Password: 'password123',
      });

    expect(response.status).toBe(201);
    expect(response.body.successful).toBe(true);
    expect(response.body.message).toBe('Login successful');
    expect(response.header['set-cookie'][0]).toContain('8012345678=mock-token');
  });

  it('should return 401 if invalid credentials', async () => {   
    (schemaInstance.where as jest.Mock).mockResolvedValueOnce(undefined);

    const response = await request(app)
      .post('/login')
      .send({
        Username: 'kahuna',
        Password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body.successful).toBe(false);
    expect(response.body.message).toBe('Invalid Username or Password');
  });
});
