import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

// Ejemplo de prueba unitaria: la base de datos se reemplaza por un mock.
describe('HealthController', () => {
  const dataSource = { query: jest.fn() };
  let controller: HealthController;

  beforeEach(async () => {
    dataSource.query.mockReset();
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: DataSource, useValue: dataSource }],
    }).compile();
    controller = moduleRef.get(HealthController);
  });

  it('responde ok cuando la base responde', async () => {
    dataSource.query.mockResolvedValue([{ '': 1 }]);
    await expect(controller.check()).resolves.toEqual({ status: 'ok', db: 'up' });
  });

  it('responde 503 cuando la base no responde', async () => {
    dataSource.query.mockRejectedValue(new Error('timeout'));
    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
