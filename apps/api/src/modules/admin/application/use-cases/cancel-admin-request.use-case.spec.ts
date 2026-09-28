import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CancelAdminRequestUseCase } from './admin-requests.use-cases';

describe('CancelAdminRequestUseCase', () => {
  const now = new Date('2030-06-01T12:00:00.000Z');
  const clock = { now: () => now };

  function makeRequest(overrides: Partial<{ id: number; statusCode: string }> = {}) {
    return {
      id: overrides.id ?? 42,
      statusCode: overrides.statusCode ?? 'PUBLISHED',
      titre: 'Courses',
      withStatus: jest.fn(function (this: { titre: string; id: number }, status: string) {
        return {
          id: this.id,
          statusCode: status,
          titre: this.titre,
        };
      }),
    };
  }

  it('cancels a request to CANCELLED (soft)', async () => {
    const request = makeRequest();
    const requests = {
      findById: jest.fn().mockResolvedValue(request),
      save: jest.fn(async (value: unknown) => value),
    };
    const useCase = new CancelAdminRequestUseCase(requests as never, clock as never);

    const result = await useCase.execute(42);

    expect(requests.findById).toHaveBeenCalledWith(42);
    expect(request.withStatus).toHaveBeenCalledWith('CANCELLED', now);
    expect(requests.save).toHaveBeenCalled();
    expect(result).toEqual({ id: 42, status: 'CANCELLED', titre: 'Courses' });
  });

  it('rejects missing request', async () => {
    const requests = {
      findById: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };
    const useCase = new CancelAdminRequestUseCase(requests as never, clock as never);

    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundException);
    expect(requests.save).not.toHaveBeenCalled();
  });

  it('rejects already cancelled request', async () => {
    const request = makeRequest({ statusCode: 'CANCELLED' });
    const requests = {
      findById: jest.fn().mockResolvedValue(request),
      save: jest.fn(),
    };
    const useCase = new CancelAdminRequestUseCase(requests as never, clock as never);

    await expect(useCase.execute(42)).rejects.toBeInstanceOf(BadRequestException);
    expect(requests.save).not.toHaveBeenCalled();
  });
});
