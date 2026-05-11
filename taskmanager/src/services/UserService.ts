// ============================================================
// SERVICE: UserService
// Responsibility: Orchestrate user business logic.
//
// Dependencies (all injected — never new'd here):
//   - IUserRepository  (data access abstraction)
//   - AuthService      (token generation)
//   - UserFactory      (creation + password hashing)
//   - EventBus         (event emission)
//   - NotificationService (notification strategy)
//
// SOLID:
//   S — Business logic only. No HTTP, no DB driver, no template.
//   D — All dependencies are abstractions passed in, not instantiated.
// ============================================================

import { IUserRepository } from '../repositories';
import { UserFactory }     from '../factories';
import { EventBus }        from '../observers';
import { AuthService }     from './AuthService';
import { NotificationService } from '../strategies';
import { CreateUserDTO, LoginDTO, UpdateUserDTO, AuthResult, IUser } from '../types';

export class UserService {
  constructor(
    private readonly userRepo:   IUserRepository,
    private readonly authService: AuthService,
    private readonly notifier:   NotificationService
  ) {}

  async register(dto: CreateUserDTO): Promise<AuthResult> {
    // Check duplicate via repository abstraction — not raw Mongoose
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new Error('EMAIL_TAKEN');

    // Factory handles hashing — UserService never touches bcrypt
    const prepared = await UserFactory.create(dto);
    const user     = await this.userRepo.save(prepared);

    // Observer: log the event — UserService doesn't care who's listening
    EventBus.emit('USER_REGISTERED', { email: user.email, name: user.name }, String(user._id));

    // Notification via Strategy — could be console, email, or SMS
    await this.notifier.notify({
      recipient: user.email,
      subject:   'Welcome to TaskManager',
      message:   `Hi ${user.name}, your account has been created successfully.`
    });

    const token = this.authService.generateToken({
      id:    String(user._id),
      email: user.email,
      role:  user.role
    });

    const { password: _, ...safeUser } = user;
    return { token, user: safeUser as Omit<IUser, 'password'> };
  }

  async login(dto: LoginDTO): Promise<AuthResult> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new Error('INVALID_CREDENTIALS');

    // Factory owns verification — strategy can change without touching this method
    const valid = await UserFactory.verifyPassword(dto.password, user.password);
    if (!valid) throw new Error('INVALID_CREDENTIALS');

    EventBus.emit('USER_LOGGED_IN', { email: user.email }, String(user._id));

    const token = this.authService.generateToken({
      id:    String(user._id),
      email: user.email,
      role:  user.role
    });

    const { password: _, ...safeUser } = user;
    return { token, user: safeUser as Omit<IUser, 'password'> };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('USER_NOT_FOUND');
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId: string, dto: UpdateUserDTO) {
    const user = await this.userRepo.update(userId, dto);
    if (!user) throw new Error('USER_NOT_FOUND');
    return user;
  }

  async getAllUsers() {
    return this.userRepo.findAll();
  }

  async deleteUser(id: string) {
    const deleted = await this.userRepo.delete(id);
    if (!deleted) throw new Error('USER_NOT_FOUND');
  }
}
