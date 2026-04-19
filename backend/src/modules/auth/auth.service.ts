import { comparePassword, generateToken } from '../../core/security';
import { findUserByEmail } from './auth.repository';
import { LoginDTO } from './auth.types';

export const login = async (dto: LoginDTO) => {
  const user = await findUserByEmail(dto.email);
  if (!user) throw { status: 401, message: 'Credenciales inválidas' };

  const valid = await comparePassword(dto.password, user.password);
  if (!valid) throw { status: 401, message: 'Credenciales inválidas' };

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
};
