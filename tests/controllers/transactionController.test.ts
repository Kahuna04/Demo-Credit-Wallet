import { fundAccount, transferFunds, withdrawal } from '../../src/controllers/transactionController';

const mockSchema = {
  users: {
    where: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
};

//   jest.mock('../../src/config/knexfile', () => ({
//     __esModule: true,
//     default: mockSchema,
//   }));

describe('UserController Funds Management Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fundAccount', () => {
    it('should fund an account and return 201 status', async () => {
      const mockReq = {
        params: { AccountNo: '1234567890' },
        body: { Amount: '100' },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const userData = {
        Balance: '0',
        AccountNo: '1234567890',
      };

      mockSchema.users.where.mockResolvedValue(userData);
      mockSchema.users.update.mockResolvedValue(true);

      await fundAccount(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        successful: true,
        message: 'Account funded successfully',
      });
    });
  });

  describe('transferFunds', () => {
    it('should transfer funds between two accounts and return 200 status', async () => {
      const mockReq = {
        params: { AccountNo: '1234567890' },
        body: { Amount: '100', to: '0987654321' },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const senderData = {
        Balance: '500',
        AccountNo: '1234567890',
      };
      const recipientData = {
        Balance: '300',
        AccountNo: '0987654321',
      };

      mockSchema.users.where.mockImplementationOnce((query) => {
        if (query.AccountNo === '1234567890') return senderData;
        return null;
      })
      .mockImplementationOnce((query) => {
        if (query.AccountNo === '0987654321') return recipientData;
        return null;
      });

      await transferFunds(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        successful: true,
        message: 'Transfer successful',
      });
    });
  });

  describe('withdrawal', () => {
    it('should process a withdrawal and return 200 status', async () => {
      const mockReq = {
        params: { AccountNo: '1234567890' },
        body: { Amount: '100' },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const userData = {
        Balance: '500',
        AccountNo: '1234567890',
      };

      mockSchema.users.where.mockResolvedValue(userData);
      mockSchema.users.update.mockResolvedValue(true);

      await withdrawal(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        successful: true,
        message: 'Withdrawal successful',
      });
    });
  });
});