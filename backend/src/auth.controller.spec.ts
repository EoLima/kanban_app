import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { Response, Request } from 'express';

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should set cookie and return success when credentials are valid', () => {
      const mockRes = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      authController.login({ username: 'user', password: 'password' }, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith('session_id', 'user-session-token', expect.any(Object));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 401 when credentials are invalid', () => {
      const mockRes = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      authController.login({ username: 'user', password: 'wrong' }, mockRes);

      expect(mockRes.cookie).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });

  describe('logout', () => {
    it('should clear cookie and return success', () => {
      const mockRes = {
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      authController.logout(mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('session_id', expect.any(Object));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('session', () => {
    it('should return authenticated true if valid session cookie is present', () => {
      const mockReq = {
        cookies: { session_id: 'user-session-token' },
      } as unknown as Request;

      const result = authController.session(mockReq);
      expect(result).toEqual({ authenticated: true });
    });

    it('should return authenticated false if session cookie is missing or invalid', () => {
      const mockReq1 = {
        cookies: {},
      } as unknown as Request;
      const mockReq2 = {
        cookies: { session_id: 'invalid-token' },
      } as unknown as Request;

      expect(authController.session(mockReq1)).toEqual({ authenticated: false });
      expect(authController.session(mockReq2)).toEqual({ authenticated: false });
    });
  });
});
