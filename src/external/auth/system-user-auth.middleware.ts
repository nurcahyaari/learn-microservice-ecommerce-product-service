import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class SystemUserAuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const resp = await axios.get(
        `${process.env.SERVICE_AUTH_HOST}/auth/jwt/system_user/access_token`,
        {
          headers: {
            Authorization: `${req.headers['authorization']}`,
          },
        },
      );
      if (resp.status !== 200) {
        throw new UnauthorizedException();
      }
      req.headers.token = req.headers['authorization'];
      req.headers.user = resp.data;
      next();
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
