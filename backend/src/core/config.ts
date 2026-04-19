import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  protectedAdminEmail: process.env.PROTECTED_ADMIN_EMAIL || 'admin@mojitobar.cl',
  protectedAdminName: process.env.PROTECTED_ADMIN_NAME || 'Administrador General',
  protectedAdminPassword: process.env.PROTECTED_ADMIN_PASSWORD || 'Admin1234!',
};
