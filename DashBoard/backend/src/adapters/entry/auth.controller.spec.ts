import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthUseCase } from '../../domain/useCases/auth.use-case.js';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        // The use case has its own spec; here we only need something to inject.
        { provide: AuthUseCase, useValue: {} },
        // JwtAuthGuard (on GET /auth/me) needs a JwtService to be created.
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET /auth/me returns the user the guard attached', () => {
    const user = { userId: 'user-1', email: 'alice@example.com' };

    expect(controller.me(user)).toEqual(user);
  });
});
