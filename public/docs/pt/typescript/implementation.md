# TypeScript: implementação

Implemente o `ts-typed` nas bordas: dados que entram sem confiança e dados que saem como promessa pública. Não há schema paralelo; uma anotação TypeScript se torna o contrato no JavaScript emitido.

```ts
import { StrictTypeError } from '@ts-typed/core';

interface CreateInvoiceInput { customerId: string; amountCents: number; notes?: string }
interface InvoiceView { id: string; customerId: string; amountCents: number }

export function createInvoice(input: CreateInvoiceInput): InvoiceView {
  const invoice = { id: crypto.randomUUID(), ...input };
  return { id: invoice.id, customerId: invoice.customerId, amountCents: invoice.amountCents };
}

try {
  createInvoice({ customerId: 'cus_1', amountCents: '1200' } as unknown as CreateInvoiceInput);
} catch (error) {
  if (error instanceof StrictTypeError) console.error(error.toJSON());
}
```

O parâmetro é verificado antes do corpo da função e o retorno antes de alcançar o chamador. Uma string em `amountCents`, um campo exigido ausente ou uma chave extra em um objeto fechado gera `StrictTypeError`. `as` não valida nada: só o build instrumentado faz isso.

Use classes quando existe estado com invariantes entre operações:

```ts
class Money {
  public readonly cents: number;
  constructor(cents: number) {
    if (!Number.isInteger(cents) || cents < 0) throw new RangeError('invalid cents');
    this.cents = cents;
  }
}
```

O construtor mantém regras semânticas como faixa ou consulta ao banco; `ts-typed` protege forma e tipos. Com `enforceReadonly`, uma segunda escrita em `cents` falha. Anote adaptadores, serviços públicos, repositórios e mappers; não adicione wrappers artificiais a toda expressão interna, pois isso repete trabalho em coleções grandes.

Para dados extensíveis, aplique `@AllowExtraProperties()` no alvo específico, nunca `allowExtraPropertiesAll` como correção rápida. Continue em [Requisições e DTOs](./requests-dtos.md) e [Respostas](./responses.md).
