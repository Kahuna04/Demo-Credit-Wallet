import request from 'supertest';
import express from 'express';
import { createUser } from '../../src/controllers/userController';
import { Schema } from '../../src/config/knexfile';

let schemaInstance: any;

jest.mock('../../src/config/knexfile', () => ({
  Schema: {
    insert: jest.fn(),
    where: jest.fn(),
  },
}));

// jest.mock('axios', () => ({
//   get: jest.fn(() =>
//     Promise.resolve({
//       data: { karma_identity: true },
//     })
//   ),
// }));

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
      PhoneNumber: '+2348070859502',
      Balance: 0.0,
    });

    const response = await request(app)
      .post('/create-user')
      .send({
        Firstname: 'Dami',
        Lastname: 'Lare',
        Username: 'kahuna',
        PhoneNumber: '+2348070859502',
        Password: 'password123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toBe({
      successful: true,
      message: 'Account created successfully',
      data: {
        Id: 1,
        Firstname: 'Dami',
        Lastname: 'Lare',
        Username: 'kahuna',
        PhoneNumber: '+2348070859502',
        Balance: 0.0,
      },
    });
  });

  it('should return 500 if an error occurs', async () => {
    (schemaInstance.insert as jest.Mock).mockRejectedValue(new Error('An Internal server error ocurred'));

    const response = await request(app)
      .post('/create-user')
      .send({
        Firstname: 'Dami',
        Lastname: 'Lare',
        Username: 'kahuna',
        PhoneNumber: '+2348070859502',
        Password: 'password123',
      });

    expect(response.status).toBe(500);
    expect(response.body).toStrictEqual({
      successful: false,
      message: 'An Internal server error ocurred',
    });
  });
});
