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
import { UserRole } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

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

      // Mock the expected output
      const expectedToken = expect.any(String);

      // Mock the `create` method of the `prismaService.user` object
      const createMock = jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue({
          id: 1,
          username: signUpDto.username,
          role: UserRole.USER,
          password: expect.any(String),
        });

      // Call the `signUp` function
      const result = await userService.signUp(signUpDto);

      // Expect the result to match the expected output
      expect(result).toEqual(expectedToken);

      // Expect the `create` method to have been called with the correct arguments
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
      // Mock the inputs
      const userId = 1;
      const updateDto: UpdateUserDto = {
        username: 'newusername',
        password: 'password123',
      };

      // Mock the expected output
      const expectedUpdatedUser: UserResponseDto = {
        id: userId,
        username: updateDto.username,
        role: UserRole.USER,
        password: expect.any(String),
      };

      // Mock the `findUnique` and `update` methods of the `prismaService.user` object
      const findUniqueMock = jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue({
          id: userId,
          username: updateDto.username,
          password: expect.any(String),
          role: UserRole.USER,
        });

      const updateMock = jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue({
          id: userId,
          username: updateDto.username,
          password: expect.any(String),
          role: UserRole.USER,
        });

      // Call the `updateUser` function
      const result = await userService.updateUser(userId, updateDto);

      // Expect the result to match the expected output
      expect(result).toEqual(expectedUpdatedUser);

      // Expect the `findUnique` method to have been called with the correct arguments
      expect(findUniqueMock).toHaveBeenCalledWith({
        where: {
          id: userId,
        },
      });

      // Expect the `update` method to have been called with the correct arguments
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
});
