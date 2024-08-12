import request from 'supertest';
import express from 'express';
import { fundAccount } from '../../src/controllers/userController';
import { Schema } from '../../src/config/knexfile';

let schemaInstance: any;

jest.mock('../../src/config/knexfile', () => ({
  Schema: {
    where: jest.fn(),
    update: jest.fn(),
  },
}));

beforeAll(async () => {
  schemaInstance = await Schema;
});

const app = express();
app.use(express.json());
app.put('/fund/:AccountNo', fundAccount);

describe('PUT /fund/:AccountNo', () => {
  it('should fund the account successfully', async () => {
    const mockUser = {
      AccountNo: '8012345678',
      Balance: 100,
    };

    (schemaInstance.where as jest.Mock).mockResolvedValue(mockUser);
    (schemaInstance.update as jest.Mock).mockResolvedValue(1);

    const response = await request(app)
      .put('/fund/8012345678')
      .send({ Amount: 50 });

    //expect(response.status).toBe(201);
    //expect(response.body.successful).toBe(true);
    //expect(response.body.message).toBe('Account funded successfully');
  });

  it('should return 404 if user not found', async () => {
    (schemaInstance.where as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .put('/fund/8012345678')
      .send({ Amount: 50 });

    //expect(response.status).toBe(404);
    //expect(response.body.successful).toBe(false);
    //expect(response.body.message).toBe('User not found');
  });

  it('should return 400 if amount is invalid', async () => {
    const response = await request(app)
      .put('/fund/8012345678')
      .send({ Amount: 'invalid' });

    //expect(response.status).toBe(400);
    //expect(response.body.successful).toBe(false);
    //expect(response.body.message).toBe('Amount is required and must be a number');
  });
});
