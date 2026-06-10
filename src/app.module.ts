import { Module } from '@nestjs/common';

import { AdminModule } from './admin/admin.module';
import { HealthController } from './health.controller';
import { InstancesModule } from './instances/instances.module';
import { PrismaModule } from './prisma/prisma.module';
import { SigningModule } from './signing/signing.module';

@Module({
  imports: [PrismaModule, SigningModule, InstancesModule, AdminModule],
  controllers: [HealthController],
})
export class AppModule {}
