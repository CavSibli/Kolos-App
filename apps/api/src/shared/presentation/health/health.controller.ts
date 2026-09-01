import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DataSource } from 'typeorm';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    const postgresReady = this.dataSource.isInitialized;
    const mongoReady = this.mongoConnection.readyState === 1;

    if (!postgresReady || !mongoReady) {
      return {
        status: 'not_ready',
        postgres: postgresReady,
        mongo: mongoReady,
      };
    }

    return { status: 'ok', postgres: true, mongo: true };
  }
}
