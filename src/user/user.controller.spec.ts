import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {
  SignInDto,
  SignUpDto,
  UpdateUserDto,
  UserResponseDto,
} from './dtos/user.dto';
import { PrismaService } from '../../prisma/prisma.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService, ConfigService],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('SignUp', () => {
    it('should create a new user and return a JWT token', async () => {
      const signUpDto: SignUpDto = {
        username: 'testuser',
        password: 'password123',
      };

      jest.spyOn(service, 'signUp').mockResolvedValue(expect.any(String));

      const result = await controller.signUp(signUpDto);

      expect(result).toEqual(expect.any(String));
      expect(service.signUp).toHaveBeenCalledWith(signUpDto);
    });

    it('should throw conflict error if user exists', async () => {
      const signUpDto: SignUpDto = {
        username: 'testuser',
        password: 'password123',
      };

      jest.spyOn(service, 'findUserByUsername').mockResolvedValue({
        id: 1,
        username: signUpDto.username,
        password: bcrypt.hashSync(signUpDto.password, 10),
        role: UserRole.USER,
      });

      await expect(controller.signUp(signUpDto)).rejects.toThrowError(
        ConflictException,
      );
    });
  });

  describe('SignIn', () => {
    it('should return a JWT token', async () => {
      const signInDto: SignInDto = {
        username: 'testuser',
        password: 'password123',
      };

      jest.spyOn(service, 'signIn').mockResolvedValue(expect.any(String));

      const result = await controller.signIn(signInDto);

      expect(result).toEqual(expect.any(String));
      expect(service.signIn).toHaveBeenCalledWith(signInDto);
    });

    it('should throw BadRequestException when invalid credentials are provided', async () => {
      const signInDto: SignInDto = {
        username: 'testuser',
        password: 'invalidPassword',
      };

      jest.spyOn(service, 'findUserByUsername').mockResolvedValue({
        id: 1,
        username: signInDto.username,
        password: 'random password',
        role: UserRole.USER,
      });

      await expect(controller.signIn(signInDto)).rejects.toThrowError(
        BadRequestException,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      jest.spyOn(service, 'getAllUsers').mockResolvedValue([
        new UserResponseDto({
          id: 1,
          username: 'testuser',
          role: UserRole.USER,
        }),
      ]);

      await expect(controller.getAllUsers({ id: 2 })).resolves.toEqual([
        new UserResponseDto({
          id: 1,
          username: 'testuser',
          role: UserRole.USER,
        }),
      ]);
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      username: 'newusername',
      newPassword: 'newpassword',
      oldPassword: 'oldpassword',
    };

    it('should update a user', async () => {
      jest.spyOn(service, 'findUserById').mockResolvedValue({
        id: 1,
        username: updateUserDto.username,
        role: UserRole.USER,
        password: bcrypt.hashSync(updateUserDto.oldPassword, 10),
      });

      jest.spyOn(service, 'updateUser').mockResolvedValue(
        new UserResponseDto({
          id: 1,
          username: updateUserDto.username,
          role: UserRole.USER,
        }),
      );

      await expect(
        controller.updateUser({ id: 1 }, updateUserDto),
      ).resolves.toEqual(
        new UserResponseDto({
          id: 1,
          username: updateUserDto.username,
          role: UserRole.USER,
        }),
      );
    });

    it('should throw BadRequestException when newPassword is provided without oldPassword', async () => {
      delete updateUserDto.oldPassword;

      jest.spyOn(service, 'findUserById').mockResolvedValue({
        id: 1,
        username: updateUserDto.username,
        role: UserRole.USER,
        password: expect.any(String),
      });

      await expect(
        controller.updateUser({ id: 1 }, updateUserDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when invalid password is provided', async () => {
      updateUserDto.oldPassword = '123';

      jest.spyOn(service, 'findUserById').mockResolvedValue({
        id: 1,
        username: updateUserDto.username,
        role: UserRole.USER,
        password: bcrypt.hashSync('randompassword', 10),
      });

      await expect(
        controller.updateUser({ id: 1 }, updateUserDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
