import { IUser, CreateUserDTO, UpdateUserDTO } from '../../types';

export interface IUserRepository {
  findAll(): Promise<Omit<IUser, 'password'>[]>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  save(dto: CreateUserDTO & { password: string }): Promise<IUser>;
  update(id: string, dto: UpdateUserDTO): Promise<Omit<IUser, 'password'> | null>;
  delete(id: string): Promise<boolean>;
}
