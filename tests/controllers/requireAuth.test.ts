import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { requireAuth } from '../../src/controllers/userController';
import { SECRET_KEY } from '../../src/config/knexfile';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

const app = express();
app.use(cookieParser());
app.get('/protected/:AccountNo', requireAuth, (req, res) => {
  res.send('Access granted');
});

describe('requireAuth Middleware', () => {
  it('should return 401 if no token is provided', async () => {
    const response = await request(app).get('/protected/8012345678');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthenticated user');
  });

  it('should return 401 if token verification fails', async () => {
    const token = 'invalid-token';
    (jwt.verify as jest.Mock).mockImplementation((_, __, cb) => {
      cb(new Error('Token verification failed'), null);
    });

    const response = await request(app)
      .get('/protected/8012345678')
      .set('Cookie', [`8012345678=${token}`]);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token verification failed');
  });

  it('should grant access if token is valid', async () => {
    const token = 'valid-token';
    (jwt.verify as jest.Mock).mockImplementation((_, __, cb) => {
      cb(null, { PhoneNumber: '08012345678' });
    });

    const response = await request(app)
      .get('/protected/8012345678')
      .set('Cookie', [`8012345678=${token}`]);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Access granted');
  });
});
