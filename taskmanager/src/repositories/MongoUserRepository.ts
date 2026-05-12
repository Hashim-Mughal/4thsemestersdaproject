// ============================================================
// PATTERN: Repository (Structural)
// Concrete MongoDB implementation of IUserRepository.
// All Mongoose calls are isolated here — services never
// import UserModel or any Mongoose primitive directly.
// ============================================================

import { UserModel }    from '../models/User';
import { IUserRepository } from './interfaces/IUserRepository';
import { IUser, CreateUserDTO, UpdateUserDTO } from '../types';

export class MongoUserRepository implements IUserRepository {
  async findAll(): Promise<Omit<IUser, 'password'>[]> {
    return UserModel.find().select('-password').lean() as Promise<Omit<IUser, 'password'>[]>;
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).lean() as Promise<IUser | null>;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).lean() as Promise<IUser | null>;
  }

  async save(dto: CreateUserDTO & { password: string }): Promise<IUser> {
    const user = new UserModel(dto);
    await user.save();
    return user.toObject() as unknown as IUser;
  }

  async update(id: string, dto: UpdateUserDTO): Promise<Omit<IUser, 'password'> | null> {
    return UserModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .select('-password')
      .lean() as Promise<Omit<IUser, 'password'> | null>;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}
