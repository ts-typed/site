# NestJS: práticas e exemplos

Um fluxo saudável combina DTO, serviço, projeção e filtro global:

```ts
@AggregateErrors()
class CreateInvoiceDto {
  public customerId: string = '';
  public totalCents: number = 0;
}

@Controller('invoices')
class InvoicesController {
  @Post()
  create(@Body() dto: CreateInvoiceDto): Promise<InvoiceResponse> {
    return service.create(dto);
  }
}
```

O DTO concentra forma de entrada e todos os erros estruturais quando isso melhora a UI; o serviço mantém regras de negócio; `InvoiceResponse` é um mapper sem campos internos; e `StrictTypeErrorFilter` traduz a falha sem vazar dados. Use `TypeErrorResponse` apenas para mensagem/status de um campo específico, e `ServerPopulated` apenas em modelos trazidos do banco.

Checklist: mantenha builder `tsc`; não feche instâncias enquanto o class-transformer copia payloads; faça paginação antes de proteger listas grandes; use `onUnsupported: "error"` no CI depois da migração; e trate erros não-ts-typed pelo mecanismo normal do Nest. Leia [Conceitos centrais](../core-concepts.md), [Otimizações](../optimizations.md) e [Limitações](../limitations.md).
