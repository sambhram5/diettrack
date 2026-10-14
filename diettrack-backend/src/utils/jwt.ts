import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config';

export interface TokenPayload {
  userId: string;
  email: string;
  jti?: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiry,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(
    { userId: payload.userId, email: payload.email, jti: crypto.randomUUID() },
    config.jwtRefreshSecret,
    {
      expiresIn: config.jwtRefreshExpiry,
    } as jwt.SignOptions
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtAccessSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
};

export const getRefreshTokenExpiry = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
};
