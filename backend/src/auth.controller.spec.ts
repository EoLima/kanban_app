import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth/auth.service';
import type { Response, Request } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: { validate: jest.Mock };

  beforeEach(async () => {
    authService = { validate: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should set cookie and return success when credentials are valid', async () => {
      authService.validate.mockResolvedValue({ id: 'user-cuid-123' });

      const mockRes = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await authController.login(
        { username: 'user', password: 'password' },
        mockRes,
      );

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'session_id',
        'user-cuid-123',
        expect.any(Object),
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 401 when credentials are invalid', async () => {
      authService.validate.mockRejectedValue(new UnauthorizedException());

      const mockRes = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await authController.login(
        { username: 'user', password: 'wrong' },
        mockRes,
      );

      expect(mockRes.cookie).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
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

      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'session_id',
        expect.any(Object),
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('session', () => {
    it('should return authenticated true if session cookie is present', () => {
      const mockReq = {
        cookies: { session_id: 'any-session-id' },
      } as unknown as Request;

      const result = authController.session(mockReq);
      expect(result).toEqual({ authenticated: true });
    });

    it('should return authenticated false if no session cookie', () => {
      const mockReq = {
        cookies: {},
      } as unknown as Request;

      expect(authController.session(mockReq)).toEqual({ authenticated: false });
    });
  });
});
