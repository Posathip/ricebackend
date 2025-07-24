import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwt_Access_Secret, jwt_Refresh_Secret } from '../config/app.config';
import { Request } from 'express';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt_Access_Secret || 'naruto',

    });
  }

  async validate(payload: { id: string; email: string }) {  //validate token
    return payload;
  }
 
}


