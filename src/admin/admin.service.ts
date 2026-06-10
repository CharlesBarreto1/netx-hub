import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { generateLicenseKey, sha256Hex } from '../common/hash';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateInstance, CreateLicensee, SetStatus } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Licenciados ───────────────────────────────────────────────────────────
  createLicensee(input: CreateLicensee) {
    return this.prisma.licensee.create({ data: input });
  }

  listLicensees() {
    return this.prisma.licensee.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { instances: true } } },
    });
  }

  // ── Instâncias ──────────────────────────────────────────────────────────────
  /**
   * Cria a instância e devolve a license key EM CLARO uma única vez (só o hash
   * é persistido). Essa key vai pro NETX_LICENSE_KEY do cliente.
   */
  async createInstance(input: CreateInstance): Promise<{
    instanceId: string;
    licenseKey: string;
    hubHint: string;
  }> {
    const licensee = await this.prisma.licensee.findUnique({
      where: { id: input.licenseeId },
    });
    if (!licensee) throw new NotFoundException('Licenciado não encontrado');

    const existing = await this.prisma.instance.findUnique({ where: { id: input.instanceId } });
    if (existing) throw new ConflictException('Instância (instanceId) já cadastrada');

    const licenseKey = generateLicenseKey();
    await this.prisma.instance.create({
      data: {
        id: input.instanceId,
        licenseeId: input.licenseeId,
        label: input.label ?? null,
        blockMode: input.blockMode,
        keyHash: sha256Hex(licenseKey),
        status: 'ACTIVE',
      },
    });
    return {
      instanceId: input.instanceId,
      licenseKey,
      hubHint: 'Configure NETX_HUB_URL + NETX_LICENSE_KEY + NETX_INSTANCE_ID no .env do cliente.',
    };
  }

  /** Lista instâncias com telemetria do último heartbeat (pro painel). */
  listInstances() {
    return this.prisma.instance.findMany({
      orderBy: { lastHeartbeatAt: { sort: 'desc', nulls: 'last' } },
      select: {
        id: true,
        label: true,
        status: true,
        blockMode: true,
        lastVersion: true,
        lastActiveContracts: true,
        lastHeartbeatAt: true,
        lastIp: true,
        createdAt: true,
        licensee: { select: { id: true, name: true, plan: true, maxContracts: true } },
      },
    });
  }

  async setStatus(instanceId: string, input: SetStatus) {
    const inst = await this.prisma.instance.findUnique({ where: { id: instanceId } });
    if (!inst) throw new NotFoundException('Instância não encontrada');
    return this.prisma.instance.update({
      where: { id: instanceId },
      data: { status: input.status },
      select: { id: true, status: true },
    });
  }

  /** Re-emite a license key (rotação/perda). Devolve a nova em claro 1x. */
  async rotateKey(instanceId: string): Promise<{ instanceId: string; licenseKey: string }> {
    const inst = await this.prisma.instance.findUnique({ where: { id: instanceId } });
    if (!inst) throw new NotFoundException('Instância não encontrada');
    const licenseKey = generateLicenseKey();
    await this.prisma.instance.update({
      where: { id: instanceId },
      data: { keyHash: sha256Hex(licenseKey) },
    });
    return { instanceId, licenseKey };
  }
}
