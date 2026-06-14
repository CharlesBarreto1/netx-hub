import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';

import { AdminGuard, type AdminRequest } from '../admin/admin.guard';
import { WikiService } from './wiki.service';

const CreateSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().max(60).optional(),
  content: z.string().max(100_000).default(''),
});
const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.string().max(60).optional(),
  content: z.string().max(100_000).optional(),
  orderIndex: z.number().int().optional(),
});

/** Wiki interna (equipe NetX). Tudo sob login admin. */
@UseGuards(AdminGuard)
@Controller('admin/wiki')
export class WikiController {
  constructor(private readonly wiki: WikiService) {}

  @Get()
  list() {
    return this.wiki.list();
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.wiki.getBySlug(slug);
  }

  @Post()
  create(@Req() req: AdminRequest, @Body() body: unknown) {
    const r = CreateSchema.safeParse(body);
    if (!r.success) throw new BadRequestException('título obrigatório');
    return this.wiki.create(r.data, req.admin?.email);
  }

  @Post(':id')
  update(@Req() req: AdminRequest, @Param('id') id: string, @Body() body: unknown) {
    const r = UpdateSchema.safeParse(body);
    if (!r.success) throw new BadRequestException('dados inválidos');
    return this.wiki.update(id, r.data, req.admin?.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wiki.remove(id);
  }
}
