// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException } from '@nestjs/common';

// import { Request } from 'express';



// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: 'secret',

//     });
//   }

//   async validate(payload: { id: string; email: string }) {  //validate token
//     return payload;
//   }
 
// }


