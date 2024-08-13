import request from 'supertest';
import express from 'express';
import { withdrawal } from '../../src/controllers/userController';
import { Schema } from '../../src/config/knexfile';

let schemaInstance: any;

jest.mock('../../src/config/knexfile', () => ({
  Schema: {
    insert: jest.fn(),
    where: jest.fn(),
    update: jest.fn(),
  },
}));

beforeAll(async () => {
  schemaInstance = await Schema;
});

const app = express();
app.use(express.json());
app.put('/withdraw/:AccountNo', withdrawal);

describe('PUT /withdraw/:AccountNo', () => {
  it('should withdraw funds successfully', async () => {
    const mockUser = {
      AccountNo: '8012345678',
      Balance: 100,
    };

    (schemaInstance.where as jest.Mock).mockResolvedValue(mockUser);
    (schemaInstance.update as jest.Mock).mockResolvedValue(1);

    const response = await request(app)
      .put('/withdraw/8012345678')
      .send({ Amount: 50 });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      successful: true,
      message: 'Withdrawal Successful',
    });
  });

  it('should return 404 if user not found', async () => {
    (schemaInstance.where as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .put('/withdraw/8012345678')
      .send({ Amount: 50 });

    expect(response.status).toEqual(404);
    expect(response.body).toEqual({
      successful: false,
      message: 'User not found',
    });
  });

  it('should return 400 if amount is invalid', async () => {
    const response = await request(app)
      .put('/withdraw/8012345678')
      .send({ Amount: 'invalid' });

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      successful: false,
      message: 'Amount is required and must be a positive number',
    });
  });

  it('should return 400 if insufficient balance', async () => {
    const mockUser = {
      AccountNo: '8012345678',
      Balance: 10,
    };

    (schemaInstance.where as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .put('/withdraw/8012345678')
      .send({ Amount: 50 });

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      successful: false,
      message: 'Insufficient balance',
    });
  });
});
