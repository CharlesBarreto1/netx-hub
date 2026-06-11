import { Injectable, NotImplementedException } from '@nestjs/common';

/**
 * Interface de pagamento. Hoje há só o stub manual; o provider EFI (Pix/cartão)
 * entra na Fase 3C implementando esta mesma interface — billing e central não
 * mudam quando ele chegar.
 */
export interface PaymentCharge {
  /** Identificador da cobrança no gateway (txid/charge id). */
  ref: string;
  method: 'PIX' | 'CARD';
  /** Pix copia-e-cola, link de cartão, etc. */
  payload?: string;
  qrImage?: string | null;
  status: 'PENDING' | 'PAID' | 'ERROR';
}

@Injectable()
export class PaymentProvider {
  /**
   * Cria uma cobrança pra uma fatura. STUB: ainda não há gateway — a Fase 3C
   * implementa EFI aqui. Por ora, a central registra "pagamento manual"
   * (cliente paga por fora e o admin confirma).
   */
  async createCharge(_invoiceId: string, _method: 'PIX' | 'CARD'): Promise<PaymentCharge> {
    throw new NotImplementedException(
      'Pagamento online (EFI) ainda não configurado. Pague por Pix/transferência e ' +
        'a NetX confirma a baixa, ou aguarde a ativação do pagamento na central.',
    );
  }
}
