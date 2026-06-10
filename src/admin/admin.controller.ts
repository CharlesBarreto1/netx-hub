import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { ZodSchema } from 'zod';

import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import {
  CreateInstanceSchema,
  CreateLicenseeSchema,
  SetStatusSchema,
} from './admin.dto';

function parse<T>(schema: ZodSchema<T>, body: unknown): T {
  const r = schema.safeParse(body);
  if (!r.success) {
    throw new BadRequestException(
      r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    );
  }
  return r.data;
}

/** Painel/admin do Hub — staff NetX. Protegido por HUB_ADMIN_TOKEN. */
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Post('licensees')
  createLicensee(@Body() body: unknown) {
    return this.admin.createLicensee(parse(CreateLicenseeSchema, body));
  }

  @Get('licensees')
  listLicensees() {
    return this.admin.listLicensees();
  }

  @Post('instances')
  createInstance(@Body() body: unknown) {
    return this.admin.createInstance(parse(CreateInstanceSchema, body));
  }

  @Get('instances')
  listInstances() {
    return this.admin.listInstances();
  }

  @Post('instances/:id/status')
  setStatus(@Param('id') id: string, @Body() body: unknown) {
    return this.admin.setStatus(id, parse(SetStatusSchema, body));
  }

  @Post('instances/:id/rotate-key')
  rotateKey(@Param('id') id: string) {
    return this.admin.rotateKey(id);
  }
}
