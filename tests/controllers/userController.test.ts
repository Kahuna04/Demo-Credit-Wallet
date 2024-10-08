import { createUser, login } from '../../src/controllers/userController';
import bcrypt from 'bcrypt';

const mockSchema = {
  users: {
    where: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
};

// jest.mock('../../src/config/knexfile', () => ({
//   __esModule: true,
//   default: mockSchema,
// }));
describe('UserController Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user and return 201 status', async () => {
      const mockReq = {
        body: {
          PhoneNumber: '+2341234567890',
          Firstname: 'John',
          Lastname: 'Doe',
          Username: 'johndoe',
          Password: 'password123',
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createUser(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
      const mockReq = {
        body: {
          PhoneNumber: '+2341234567890',
          Firstname: 'John',
          Lastname: 'Doe',
          Username: 'johndoe',
          Password: 'password123',
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockSchema.users.insert.mockRejectedValue(new Error('DB Error'));

      await createUser(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        successful: false,
        message: 'An Internal server error occurred',
      });
    });
  });

  describe('login', () => {
    it('should authenticate a valid user and return 200 status', async () => {
      const mockReq = {
        body: {
          Username: 'johndoe',
          Password: 'password123',
        },
      };
      const mockRes = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock user data
      const userData = {
        Id: 1,
        Username: 'johndoe',
        Password: bcrypt.hashSync('password123', 10),
      };

      // Mock the user retrieval and password comparison
      mockSchema.users.where.mockResolvedValue(userData);
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      await login(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        successful: true,
        message: 'Login successful',
      });
      expect(mockRes.cookie).toHaveBeenCalledWith('session', expect.any(String)); 
    });

    it('should handle invalid credentials and return 401 status', async () => {
      const mockReq = {
        body: {
          Username: 'invalid',
          Password: 'wrong',
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock the user retrieval and password comparison
      mockSchema.users.where.mockResolvedValue(null);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await login(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        successful: false,
        message: 'Invalid Username or Password',
      });
    });
  });
});