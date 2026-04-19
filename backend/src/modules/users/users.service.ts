import { hashPassword } from '../../core/security';
import { config } from '../../core/config';
import { createUser, getAllUsers, deleteUser, getUserById, upsertProtectedAdmin } from './users.repository';
import { CreateUserDTO } from './users.types';

export const registerUser = async (dto: CreateUserDTO) => {
  const hashed = await hashPassword(dto.password);
  return createUser({ ...dto, password: hashed });
};

export const listUsers = async () => getAllUsers();

export const removeUser = async (id: number) => {
  const user = await getUserById(id);
  if (!user) throw { status: 404, message: 'Usuario no encontrado' };

  if (user.email.toLowerCase() === config.protectedAdminEmail.toLowerCase()) {
    throw { status: 403, message: 'La cuenta admin protegida no se puede eliminar' };
  }

  return deleteUser(id);
};

export const ensureProtectedAdminAccount = async () => {
  const hashed = await hashPassword(config.protectedAdminPassword);
  await upsertProtectedAdmin({
    name: config.protectedAdminName,
    email: config.protectedAdminEmail,
    password: hashed,
  });
};
