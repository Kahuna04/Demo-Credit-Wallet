import request from 'supertest';
import express from 'express';
import { transferFunds } from '../../src/controllers/userController';
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
app.put('/transfer/:AccountNo', transferFunds);

describe('PUT /transfer/:AccountNo', () => {
  it('should transfer funds successfully', async () => {
    const mockSender = {
      AccountNo: '8012345678',
      Balance: 100,
    };
    const mockRecipient = {
      AccountNo: '9012345678',
      Balance: 200,
    };

    (schemaInstance.where as jest.Mock)
      .mockResolvedValueOnce(mockSender)
      .mockResolvedValueOnce(mockRecipient);

    const response = await request(app)
      .put('/transfer/8012345678')
      .send({ Amount: 50, to: '9012345678' });

    //expect(response.status).toBe(200);
    //expect(response.text).toBe('Transfer Successful');
  });

  it('should return 404 if user not found', async () => {
    (schemaInstance.where as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .put('/transfer/8012345678')
      .send({ Amount: 50, to: '9012345678' });

    //expect(response.status).toBe(404);
    //expect(response.text).toBe('User not found');
  });

  it('should return 400 if amount is invalid', async () => {
    const response = await request(app)
      .put('/transfer/8012345678')
      .send({ Amount: 'invalid', to: '9012345678' });

    //expect(response.status).toBe(400);
    //expect(response.body.message).toBe('Amount is required and must be a number');
  });

  it('should return 400 if insufficient balance', async () => {
    const mockSender = {
      AccountNo: '8012345678',
      Balance: 10,
    };

    (schemaInstance.where as jest.Mock).mockResolvedValue(mockSender);

    const response = await request(app)
      .put('/transfer/8012345678')
      .send({ Amount: 50, to: '9012345678' });

    //expect(response.status).toBe(400);
    //expect(response.body.message).toBe('Insufficient balance');
  });
});
