# Express: práticas e exemplos

Uma rota pequena deve encaminhar, um serviço deve validar sua entrada/saída e o middleware deve renderizar o erro:

```ts
app.post('/invites', async (req, res, next) => {
  try {
    const invite = await sendInvite(req.body as SendInviteDto);
    res.status(201).json(invite);
  } catch (error) {
    next(error);
  }
});

app.use(typedErrorHandler({
  formatResponse: (body) => ({ ok: false, error: body }),
}));
```

Mantenha `express.json()` antes das rotas e `typedErrorHandler()` depois delas. Não exponha `error.message` de exceções desconhecidas; deixe o fallback registrar e responder segundo a política do produto. Use DTOs fechados, `AggregateErrors` em formulários, value objects para regras semânticas e mappers para remover segredos. Para listas, pagine e projete primeiro; `TTOptImmut` é uma escolha para respostas simples publicadas como snapshot.

Leia [Typed boundaries](../core-concepts.md), [Otimizações](../optimizations.md) e [Limitações](../limitations.md) antes de ampliar a proteção de um fluxo crítico.
