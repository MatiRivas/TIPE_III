import prisma from '../../core/database';
import { CreateUserDTO } from './users.types';

export const createUser = async (data: CreateUserDTO & { password: string }) => {
  return prisma.user.create({ data });
};

export const getAllUsers = async () => {
  return prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
};

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({ where: { id }, select: { id: true, email: true, role: true } });
};

export const deleteUser = async (id: number) => {
  return prisma.user.delete({ where: { id } });
};

export const upsertProtectedAdmin = async (data: { name: string; email: string; password: string }) => {
  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: { ...data, role: 'ADMIN' },
  });
};
