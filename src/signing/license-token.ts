/**
 * Formato do token de licença — ESPELHO de
 * packages/shared/src/licensing/token.ts no repo do NetX. Manter em sincronia:
 * se mudar aqui, mude lá (e vice-versa), senão a verificação no cliente quebra.
 */

export const LICENSE_TOKEN_TYP = 'netx-lic';
export const LICENSE_TOKEN_ISS = 'netx-hub';

export type LicenseStatus = 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
export type LicenseBlockMode = 'UI_ONLY' | 'UI_AND_PROVISIONING';

export interface LicenseClaims {
  iss: string; // "netx-hub"
  sub: string; // instanceId
  status: LicenseStatus;
  plan: string;
  maxContracts: number;
  blockMode: LicenseBlockMode;
  iat: number; // epoch s
  exp: number; // epoch s
  graceUntil?: number; // epoch s
}
