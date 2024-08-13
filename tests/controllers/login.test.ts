import request from 'supertest';
import express from 'express';
import { login } from '../../src/controllers/userController';
import { Schema } from '../../src/config/knexfile';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let schemaInstance: any;

jest.mock('jsonwebtoken');
jest.mock('bcrypt');
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log in a user successfully', async () => {
    const mockUser = { 
      Username: 'kahuna', 
      Password: 'hashedpassword123', 
      PhoneNumber: '08070859502', 
      AccountNo: '8012345678' 
    };

    (schemaInstance.where as jest.Mock).mockReturnValue({
      first: jest.fn().mockResolvedValue(mockUser),
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('mock-token');

    const response = await request(app)
      .post('/login')
      .send({
        Username: 'kahuna',
        Password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      successful: true,
      message: 'Login successful',
    });
    expect(response.header['set-cookie'][0]).toContain('8012345678=mock-token');
  });

  it('should return 401 if invalid credentials', async () => {   
    (schemaInstance.where as jest.Mock).mockReturnValue({
      first: jest.fn().mockResolvedValue(undefined),
    });

    const response = await request(app)
      .post('/login')
      .send({
        Username: 'kahuna',
        Password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      successful: false,
      message: 'Invalid Username or Password',
    });
  });

  it('should return 500 if SECRET_KEY is undefined', async () => {
    const mockUser = { 
      Username: 'kahuna', 
      Password: 'hashedpassword', 
      PhoneNumber: '08070859502', 
      AccountNo: '8070859502' 
    };

    (schemaInstance.where as jest.Mock).mockReturnValue({
      first: jest.fn().mockResolvedValue(mockUser),
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockImplementation(() => {
      throw new Error('SECRET_KEY is undefined');
    });

    const response = await request(app)
      .post('/login')
      .send({
        Username: 'kahuna',
        Password: 'password123',
      });

    expect(response.status).toEqual(500);
    expect(response.body).toEqual({
      successful: false,
      message: 'An internal server error occurred',
    });
  });

  it('should return 400 if Username or Password is missing', async () => {
    const response = await request(app)
      .post('/login')
      .send({ Username: '' });

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      successful: false,
      message: 'Username and Password are required',
    });
  });
});
