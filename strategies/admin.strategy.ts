// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// // import { jwt_Access_Secret } from 'src/config/app.config';



// @Injectable()
// export class AdminJwtStrategy extends PassportStrategy(Strategy,'adminjwt') {
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey:'secret',
//     });
//   }

//   // async validate(payload: { id: string; email: string }) {  //validate token
//   //   return payload;
//   // }
//   async validate(payload: any) { 
//     console.log(payload.roleUserLevel)
//      if(payload.roleUserLevel !== "Admin"){
//       throw new UnauthorizedException('You do not have the required role to access this resource');
//      }//validate token
//     else{
//       return payload
//     }
//   }
// }


