import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { OauthController } from './oauth.controller.js';
import { ProviderService } from '../../domain/useCases/provider.service.js';
import { ProviderEnum } from '../../dto/oauth.dto.js';

describe('OauthController', () => {
  let controller: OauthController;
  const providerService = { authentificate: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OauthController],
      providers: [
        { provide: ProviderService, useValue: providerService },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<OauthController>(OauthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('links the provider to the user from the token, not from the request', () => {
    const user = { userId: 'user-1', email: 'alice@example.com' };

    controller.registerServiceOauth(ProviderEnum.GITHUB, user, { code: 'abc' });

    expect(providerService.authentificate).toHaveBeenCalledWith('user-1', {
      ProviderName: ProviderEnum.GITHUB,
      data: { code: 'abc' },
    });
  });
});
