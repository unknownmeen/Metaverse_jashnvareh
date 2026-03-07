import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Gender, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { UpdateProfileInput } from '../dto/update-profile.input';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserByIdInput } from '../dto/update-user-by-id.input';
import { ChangeRoleInput } from '../dto/change-role.input';

@Injectable()
export class UserWriteService {
  constructor(private readonly userRepository: UserRepository) {}

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const updateData: Record<string, any> = {};

    if (input.realName !== undefined) {
      updateData.realName = input.realName;
    }

    if (input.displayName !== undefined) {
      updateData.displayName = input.displayName;
    }

    if (input.avatarUrl !== undefined) {
      updateData.avatarUrl = input.avatarUrl;
    }

    if (input.newPassword) {
      const user = await this.userRepository.findById(userId);
      if (!user) throw new NotFoundException('کاربر یافت نشد');
      if (!input.currentPassword) {
        throw new BadRequestException('برای تغییر رمز عبور، رمز فعلی را وارد کنید');
      }
      const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!valid) {
        throw new BadRequestException('رمز عبور فعلی صحیح نیست');
      }
      updateData.passwordHash = await bcrypt.hash(input.newPassword, 10);
    }

    return this.userRepository.update(userId, updateData);
  }

  async createUsers(inputs: CreateUserInput[]): Promise<User[]> {
    const results: User[] = [];
    for (const input of inputs) {
      const existing = await this.userRepository.findByPhone(input.phone);
      if (existing) {
        throw new ConflictException(`شماره ${input.phone} قبلاً ثبت شده است`);
      }
      const passwordHash = await bcrypt.hash(input.password, 10);
      const user = await this.userRepository.create({
        phone: input.phone,
        passwordHash,
        role: input.role,
        gender: input.gender ?? Gender.MALE,
        realName: input.realName?.trim() || null,
        displayName: input.displayName?.trim() || null,
      });
      results.push(user);
    }
    return results;
  }

  async updateUsers(updates: UpdateUserByIdInput[]): Promise<User[]> {
    const results: User[] = [];
    for (const { userId, input } of updates) {
      const existing = await this.userRepository.findById(userId);
      if (!existing) {
        throw new NotFoundException(`کاربر با شناسه ${userId} یافت نشد`);
      }
      if (input.phone && input.phone !== existing.phone) {
        const phoneTaken = await this.userRepository.findByPhone(input.phone);
        if (phoneTaken) {
          throw new ConflictException(`شماره ${input.phone} قبلاً ثبت شده است`);
        }
      }
      const updateData: Record<string, unknown> = {};
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.realName !== undefined) updateData.realName = input.realName?.trim() || null;
      if (input.displayName !== undefined) updateData.displayName = input.displayName?.trim() || null;
      const user = await this.userRepository.update(userId, updateData);
      results.push(user);
    }
    return results;
  }

  async changeRoles(changes: ChangeRoleInput[]): Promise<User[]> {
    const results: User[] = [];
    for (const { userId, role } of changes) {
      const user = await this.userRepository.update(userId, { role });
      results.push(user);
    }
    return results;
  }

  async deleteUsers(ids: string[]): Promise<number> {
    return this.userRepository.deleteMany(ids);
  }
}
