import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserHealthProfile } from './entities/user-health-profile.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

const mockUser = {
  id: 'user-uuid',
  email: 'test@example.com',
  display_name: 'Test User',
  avatar_url: null,
  is_active: true,
  is_verified: false,
};

const makeRepo = (overrides = {}) => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: ReturnType<typeof makeRepo>;
  let healthRepo: ReturnType<typeof makeRepo>;
  let refreshRepo: ReturnType<typeof makeRepo>;

  beforeEach(async () => {
    userRepo = makeRepo();
    healthRepo = makeRepo();
    refreshRepo = makeRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(UserHealthProfile), useValue: healthRepo },
        { provide: getRepositoryToken(RefreshToken), useValue: refreshRepo },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── findById ────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should return user when found', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findById('user-uuid');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findByEmail ─────────────────────────────────────────────────────────

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null when not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const result = await service.findByEmail('no@example.com');
      expect(result).toBeNull();
    });
  });

  // ─── updateProfile ───────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('should update display_name', async () => {
      const updated = { ...mockUser, display_name: 'New Name' };
      userRepo.findOne.mockResolvedValue({ ...mockUser });
      userRepo.save.mockResolvedValue(updated);

      const result = await service.updateProfile('user-uuid', { display_name: 'New Name' });
      expect(result.display_name).toBe('New Name');
    });

    it('should update avatar_url to null', async () => {
      const updated = { ...mockUser, avatar_url: null };
      userRepo.findOne.mockResolvedValue({ ...mockUser, avatar_url: 'old-url' });
      userRepo.save.mockResolvedValue(updated);

      const result = await service.updateProfile('user-uuid', { avatar_url: null });
      expect(result.avatar_url).toBeNull();
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.updateProfile('bad-id', { display_name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // ─── deactivateAccount ───────────────────────────────────────────────────

  describe('deactivateAccount', () => {
    it('should set is_active=false and delete refresh tokens', async () => {
      const user = { ...mockUser, is_active: true };
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue({ ...user, is_active: false });
      refreshRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deactivateAccount('user-uuid');

      expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({ is_active: false }));
      expect(refreshRepo.delete).toHaveBeenCalledWith({ user_id: 'user-uuid' });
    });
  });

  // ─── getAllUsers ──────────────────────────────────────────────────────────

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      userRepo.findAndCount.mockResolvedValue([[mockUser], 1]);
      const result = await service.getAllUsers(10, 0);
      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  // ─── Health Profile ───────────────────────────────────────────────────────

  describe('getHealthProfile', () => {
    it('should return health profile', async () => {
      const profile = { userId: 'user-uuid', heightCm: 170, initialWeightKg: 65 };
      healthRepo.findOne.mockResolvedValue(profile);
      const result = await service.getHealthProfile('user-uuid');
      expect(result).toEqual(profile);
    });

    it('should return null if no profile', async () => {
      healthRepo.findOne.mockResolvedValue(null);
      const result = await service.getHealthProfile('user-uuid');
      expect(result).toBeNull();
    });
  });

  describe('updateHealthProfile', () => {
    it('should update existing profile', async () => {
      const existing = { userId: 'user-uuid', heightCm: 170 };
      healthRepo.findOne.mockResolvedValue(existing);
      healthRepo.save.mockResolvedValue({ ...existing, heightCm: 175 });

      const result = await service.updateHealthProfile('user-uuid', { heightCm: 175 } as any);
      expect(result.heightCm).toBe(175);
    });

    it('should create new profile if not exists', async () => {
      healthRepo.findOne.mockResolvedValue(null);
      healthRepo.create.mockReturnValue({ userId: 'user-uuid', heightCm: 170 });
      healthRepo.save.mockResolvedValue({ userId: 'user-uuid', heightCm: 170 });

      const result = await service.updateHealthProfile('user-uuid', { heightCm: 170 } as any);
      expect(healthRepo.create).toHaveBeenCalled();
      expect(result.heightCm).toBe(170);
    });
  });
});
