// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable } from '@nestjs/common';

// import { Request } from 'express';

// @Injectable()
// export class RefreshJwtStrategy extends PassportStrategy(Strategy,
//   'jwt-refresh') {
//   constructor() {
//     super({
//       // jwtFromRequest: ExtractJwt.fromExtractors([
//       //   RefreshJwtStrategy.extractJWT,
      
//       // ]),
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: 'eodm-weomfpewom',
  
//     });
//   }

//   // private static extractJWT(req: Request): string | null {
//   //   if (req.cookies && 'token' in req.cookies) {
//   //     return req.cookies.token
//   //   }
//   //   return null;
//   // }

//   async validate(payload: { id: string; email: string ,roleUserLevel: string}) {  //validate token
//     return payload;
//   }
// }


