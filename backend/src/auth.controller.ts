import { Controller, Post, Get, Body, Res, Req, HttpStatus } from '@nestjs/common';
import * as express from 'express';

@Controller('api/auth')
export class AuthController {
  @Post('login')
  login(@Body() body: any, @Res() res: express.Response) {
    const { username, password } = body;
    if (username === 'user' && password === 'password') {
      res.cookie('session_id', 'user-session-token', {
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      return res.status(HttpStatus.OK).json({ success: true });
    }
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
  }

  @Post('logout')
  logout(@Res() res: express.Response) {
    res.clearCookie('session_id', {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
    });
    return res.status(HttpStatus.OK).json({ success: true });
  }

  @Get('session')
  session(@Req() req: express.Request) {
    const sessionId = req.cookies?.['session_id'];
    if (sessionId === 'user-session-token') {
      return { authenticated: true };
    }
    return { authenticated: false };
  }
}
