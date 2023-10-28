import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import {
  SignInDto,
  SignUpDto,
  UpdateUserDto,
  UserResponseDto,
} from './dtos/user.dto';
import { UserService } from './user.service';
import { Url, UserRole } from '@prisma/client';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();
    userService = new UserService(prismaService, new ConfigService());
  });

  describe('signUp', () => {
    it('should create a new user and return a JWT token', async () => {
      const signUpDto: SignUpDto = {
        username: 'testuser',
        password: 'password123',
      };

      const expectedToken = expect.any(String);

      jest
        .spyOn(userService, 'findUserByUsername')
        .mockResolvedValue(undefined);

      const createMock = jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue({
          id: 1,
          username: signUpDto.username,
          role: UserRole.USER,
          password: expect.any(String),
        });

      const result = await userService.signUp(signUpDto);

      expect(result).toEqual(expectedToken);

      expect(createMock).toHaveBeenCalledWith({
        data: {
          username: signUpDto.username,
          password: expect.any(String),
        },
      });
    });
  });

  describe('signIn', () => {
    it('should return a JWT token when valid credentials are provided', async () => {
      // Mock the inputs
      const signInDto: SignInDto = {
        username: 'testuser',
        password: 'password123',
      };

      // Mock the expected output
      const expectedToken = expect.any(String);

      const findUserByUsernameMock = jest
        .spyOn(userService, 'findUserByUsername')
        .mockResolvedValue({
          id: 1,
          username: signInDto.username,
          password: bcrypt.hashSync(signInDto.password, 10),
          role: UserRole.USER,
        });

      const compareMock = jest.spyOn(bcrypt, 'compare');

      const result = await userService.signIn(signInDto);

      expect(result).toEqual(expectedToken);

      expect(findUserByUsernameMock).toHaveBeenCalledWith(signInDto.username);

      expect(compareMock).toHaveBeenCalledWith(
        signInDto.password,
        expect.any(String),
      );
    });

    it('should throw BadRequestException when invalid credentials are provided', async () => {
      const signInDto: SignInDto = {
        username: 'testuser',
        password: 'invalidPassword',
      };

      const findUserByUsernameMock = jest
        .spyOn(userService, 'findUserByUsername')
        .mockResolvedValue({
          id: 1,
          username: signInDto.username,
          password: 'hashedPassword',
          role: UserRole.USER,
        });

      const compareMock = jest.spyOn(bcrypt, 'compare');

      await expect(userService.signIn(signInDto)).rejects.toThrowError(
        BadRequestException,
      );

      expect(findUserByUsernameMock).toHaveBeenCalledWith(signInDto.username);

      expect(compareMock).toHaveBeenCalledWith(
        signInDto.password,
        expect.any(String),
      );
    });
  });

  describe('updateUser', () => {
    it('should update the user and return the updated user response', async () => {
      const userId = 1;
      const updateDto: UpdateUserDto = {
        username: 'newusername',
        oldPassword: 'password123',
        newPassword: 'newpassword',
      };

      const expectedUpdatedUser: UserResponseDto = {
        id: userId,
        username: updateDto.username,
        role: UserRole.USER,
        password: expect.any(String),
      };

      jest.spyOn(userService, 'findUserById').mockResolvedValue({
        id: 1,
        username: updateDto.username,
        role: UserRole.USER,
        password: bcrypt.hashSync(updateDto.oldPassword, 10),
      });

      const updateMock = jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue({
          id: userId,
          username: updateDto.username,
          password: expect.any(String),
          role: UserRole.USER,
        });

      const result = await userService.updateUser(userId, updateDto);

      expect(result).toEqual(expectedUpdatedUser);

      expect(updateMock).toHaveBeenCalledWith({
        where: {
          id: userId,
        },
        data: {
          username: updateDto.username,
          password: expect.any(String),
        },
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete the user and return undefined', async () => {
      const userId = 1;
      const adminId = 2;

      const userToResolve = {
        id: userId,
        username: 'User1',
        role: UserRole.USER,
        password: expect.any(String),
      };

      const userToDeleteMock = jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(userToResolve) as jest.Mock;

      const userUrlsMock = jest
        .spyOn(prismaService.url, 'findMany')
        .mockResolvedValue([]) as jest.Mock;

      const deleteManyClicksMock = jest
        .spyOn(prismaService.click, 'deleteMany')
        .mockResolvedValue({ count: 0 }) as jest.Mock;

      const deleteManyUrlsMock = jest
        .spyOn(prismaService.url, 'deleteMany')
        .mockResolvedValue({ count: 0 }) as jest.Mock;

      const deleteUserMock = jest
        .spyOn(prismaService.user, 'delete')
        .mockResolvedValue(userToResolve) as jest.Mock;

      const result = await userService.deleteUser(userId, adminId);

      expect(userToDeleteMock).toHaveBeenCalledWith({
        where: {
          id: userId,
        },
      });

      expect(userUrlsMock).toHaveBeenCalledWith({
        where: {
          user_id: userId,
        },
      });

      expect(deleteManyClicksMock).toHaveBeenCalledWith({
        where: {
          url_id: {
            in: [...userUrlsMock.mock.calls.map((url: Url) => url.id)],
          },
        },
      });

      expect(deleteManyUrlsMock).toHaveBeenCalledWith({
        where: {
          user_id: userId,
        },
      });

      expect(deleteUserMock).toHaveBeenCalledWith({
        where: { id: userId },
      });

      expect(result).toBe(undefined);
    });

    it('should throw forbidden error if user to delete is also an operating admin', async () => {
      const userId = 1;
      const adminId = 1;

      const userToResolve = {
        id: userId,
        username: 'User1',
        role: UserRole.USER,
        password: expect.any(String),
      };

      const userToDeleteMock = jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(userToResolve) as jest.Mock;

      await expect(userService.deleteUser(userId, adminId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(userToDeleteMock).toHaveBeenCalledWith({
        where: {
          id: userId,
        },
      });
    });
  });
});
