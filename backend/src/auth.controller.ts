import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  HttpStatus,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth/auth.service';
import { LoginDto } from './auth/dto/login.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    try {
      const user = await this.authService.validate(
        body.username,
        body.password,
      );
      res.cookie('session_id', user.id, {
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(HttpStatus.OK).json({ success: true });
    } catch {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Invalid credentials' });
    }
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('session_id', {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
    });
    return res.status(HttpStatus.OK).json({ success: true });
  }

  @Get('session')
  session(@Req() req: Request) {
    const sessionId = req.cookies?.['session_id'];
    if (sessionId) {
      return { authenticated: true };
    }
    return { authenticated: false };
  }
}
