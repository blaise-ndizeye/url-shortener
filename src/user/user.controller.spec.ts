import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SignUpDto } from './dtos/user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService, ConfigService],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
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
});
