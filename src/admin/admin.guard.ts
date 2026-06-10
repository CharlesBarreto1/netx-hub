import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';

/**
 * Auth do painel/admin do Hub (staff NetX). MVP: um único token compartilhado
 * via header `x-admin-token`, comparado em tempo constante. Evoluir pra users
 * por pessoa quando houver equipe. Sem HUB_ADMIN_TOKEN no env, recusa tudo.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.HUB_ADMIN_TOKEN;
    if (!expected) {
      throw new UnauthorizedException('HUB_ADMIN_TOKEN não configurado no Hub');
    }
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    const got = req.headers['x-admin-token'] ?? '';
    const a = Buffer.from(got);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('admin token inválido');
    }
    return true;
  }
}
