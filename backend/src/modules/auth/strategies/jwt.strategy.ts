import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// cấu trúc payload
export interface JwtPayload {
  sub: string; // user id = subject = sub
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // get token from header
      ignoreExpiration: false, // không bỏ qua expiration, nếu token hết hạn sẽ trả về 401 --> reject
      secretOrKey: process.env.JWT_SECRET || 'khiemhehe',
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload; // payload sẽ được attach vào request.user sau khi token hợp lệ, để controller có thể truy cập thông tin user
  }
}
// jwtStrategy --> authenticate user = JWT token
