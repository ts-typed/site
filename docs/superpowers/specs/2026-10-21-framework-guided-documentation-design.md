# Documentação guiada por framework — Design

## Resumo

Reorganizar a documentação do TS Typed em dois níveis: uma área global para o que é universal à biblioteca e grupos expansíveis para TypeScript puro, Express e NestJS. O framework fará parte da URL apenas de páginas específicas e definirá seus exemplos, próximos passos e boas práticas.

## Pedido original

O usuário pediu que a pessoa escolha o framework logo no início e que acessos diretos a páginas futuras também exijam essa escolha. A documentação deve ensinar instalação, `ts-typed init`, configuração, validação em requests e responses, uso do runtime, tratamento de erros, Value Objects/validators, conceitos avançados, otimização, limitações e benchmarks. A nova CLI está sendo desenvolvida em paralelo; a documentação deve estar pronta para refletir suas opções finais, sem antecipar comandos não confirmados.

## Problema e objetivo

A documentação atual é uma coleção linear de páginas técnicas. A seleção de framework existe apenas em “Getting started”, não persiste, não muda a navegação e não funciona para deep links. Isso força desenvolvedores de Express e NestJS a filtrar mentalmente conteúdo que não lhes cabe e esconde o conteúdo compartilhado que não exige escolha alguma.

O objetivo é oferecer um caminho prático, contextual e compartilhável para instalar, configurar e aplicar o TS Typed corretamente, mantendo uma segunda camada para aprender a fundo suas garantias e limites.

## Contexto do projeto

- Aplicação Angular 22 standalone, com SSR, Tailwind e `ngx-markdown`.
- Rotas atuais: `/:lang/docs/:version/:slug`; o conteúdo é carregado de `public/docs/<lang>/<slug>.md`.
- Há versões de documentação `major.minor`; a versão atual é `0.1` e conteúdo sem diretório é a linha corrente.
- PT e EN são idiomas suportados e precisam permanecer equivalentes.
- `GettingStartedComponent` já apresenta comandos distintos por framework, mas usa estado somente local.
- O pacote core, as integrações Express/NestJS e validators vivem em repositórios/árvores paralelas. A CLI e seus comandos estão em alteração paralela e são a fonte de verdade de opções de `init`, instalação opcional de validators e instalação de filtros/handlers globais.

## Decisões e suposições

1. Páginas globais usam `/:lang/docs/:version/:slug`; páginas específicas usam `/:lang/docs/:version/:framework/:slug`, com `typescript`, `express` ou `nestjs`.
2. A raiz abre a introdução/overview global. TypeScript, Express e NestJS aparecem como grupos expansíveis, cada qual com página inicial e subpáginas próprias.
3. Um link global nunca exige escolha. Um link específico já carrega seu contexto. Rotas legadas ambíguas não escolhem um framework silenciosamente: oferecem uma escolha segura.
4. O menu será um catálogo tipado de páginas globais e grupos de framework; não haverá cópia de componentes por framework.
5. O conteúdo em Markdown será organizado por jornada global e por framework. Reutilizar conteúdo idêntico; criar variantes quando comportamento ou exemplo mudar.
6. Cada página específica inclui exemplos completos, recomendações de implementação e boas práticas do framework.
7. Toda página de documentação terá, no rodapé, navegação sequencial de “anterior” e “próximo”, gerada pelo mesmo catálogo do menu. Ela apresentará o título e o objetivo da próxima etapa para que a pessoa possa seguir a jornada sem voltar à sidebar.
8. A ordem principal será: instalação → `init` e configuração → implementação no framework → respostas/erros e práticas de produção → otimizações → conceitos aprofundados. Páginas globais usam o fluxo global; ao entrar em um framework, o fluxo passa a respeitar somente as etapas daquele submenu e retorna de forma explícita à próxima etapa global quando ele termina.
9. Páginas práticas podem encerrar com uma seção curta de aprofundamento, antes da navegação sequencial. Ela explicita a ligação entre a tarefa recém-realizada e o conceito global correspondente, com links internos canônicos; não substitui a explicação prática nem aumenta artificialmente o submenu.
10. Comandos e opções dependentes da CLI serão centralizados e conferidos contra a implementação final da CLI antes do fechamento.
11. Não haverá commit ou push como parte deste trabalho.

## Escopo

### Dentro

- Navegação global com grupos expansíveis por framework e rotas canônicas específicas.
- Tratamento seguro de links legados/ambíguos, sem bloquear acesso ao conteúdo global.
- Navegação desktop e móvel com estado expansível e indicação do framework ativo.
- Nova arquitetura de conteúdo PT/EN, incluindo a jornada prática e a camada de conceitos.
- Referência de instalação, `init`, arquivo `typets.config.json`, requests, responses, dados em runtime, erros, Value Objects/validators, conceitos, otimizações, limitações e performance.
- Testes unitários das rotas, seleção, retorno ao destino e menu filtrado; build SSR.
- Revisão final dos comandos e integrações dependentes da CLI paralela.

### Fora

- Alterar a implementação do compiler, CLI, Express, NestJS ou validators.
- Publicar documentação, pacotes ou site.
- Inventar opções, nomes de flags, comportamento de instalação ou contratos de erro ainda não confirmados na CLI.
- Mudar a política de versionamento da documentação.

## Regras e comportamento esperado

### Entrada e URLs

| Situação | Resultado |
| --- | --- |
| `/pt/docs/0.1` | Mostra a introdução/overview global. |
| `/pt/docs/0.1/nestjs/requests` | Mostra a página NestJS de requests e menu NestJS. |
| `/pt/docs/0.1/requests` | É tratado como link legado ambíguo: oferece TypeScript, Express e NestJS antes de abrir uma página específica. |
| Slug inexistente para o framework escolhido | Exibe uma página de não encontrado no layout, com ação para voltar à página inicial daquele framework. |
| Clique em TypeScript, Express ou NestJS | Expande/fecha o submenu; o título do grupo também abre sua página inicial. |
| Troca de versão | Mantém framework e slug se ambos existirem na versão alvo; caso contrário, leva à introdução global da versão alvo. |

### Hierarquia de conteúdo

O menu global contém **Introdução/Overview**, **Primeiros passos**, **Conceitos**, **Configuração**, **Value Objects e validators**, **Otimizações**, **Limitações**, **Performance** e **Benchmarks**. Essas páginas explicam o contrato comum e linkam para usos concretos sem assumir HTTP.

Cada grupo contém somente a orientação que muda sua implementação:

1. **TypeScript** — instalação e `init` para projetos puros; build/execução; fronteiras em argumentos, variáveis, campos e retornos; práticas para bibliotecas, CLIs e workers.
2. **Express** — instalação/bootstrapping; requests e DTOs; responses e `TTOptImmut`; middleware/handler global; resposta de erro customizada; exemplos completos de controller e boas práticas de API.
3. **NestJS** — instalação/bootstrapping; DTOs, `ValidationPipe` e `AggregateErrors`; responses; `StrictTypeErrorFilter` global; `StrictTypeHttpError` para filtros próprios; exemplos completos de controller/provider e boas práticas de módulos.

No contexto TypeScript puro, páginas HTTP específicas não aparecem. Express mostrará middleware/handler global e customização Express. NestJS mostrará filtro global, `StrictTypeHttpError`, DTOs e integração com `ValidationPipe` quando aplicável.

### Fluxo guiado no rodapé

Além da sidebar, cada página terá um rodapé com dois controles de navegação, como na documentação do NestJS: **Anterior** e **Próximo**. O próximo passo terá texto orientado à ação — por exemplo, “Configurar seu projeto”, “Validar requests no Express” ou “Otimizar respostas imutáveis” — e não apenas o título da página.

O fluxo global introduz a biblioteca e conduz para a configuração. A página inicial de cada framework entra no caminho prático próprio: instalar → executar `init` → configurar → implementar requests/DTOs e validação de runtime → tratar erros → aplicar boas práticas de respostas → otimizar. Ao concluir esse caminho, o próximo passo aponta para a camada global de conceitos aprofundados. A pessoa pode sair do fluxo a qualquer momento pela sidebar, mas os botões nunca apontam para páginas indisponíveis naquele framework.

### Dicas de aprofundamento contextual

Quando uma página prática usar um conceito que merece estudo separado, ela termina o conteúdo com uma seção curta, por exemplo **Aprofunde-se** (PT) ou **Go deeper** (EN). Cada dica contém uma frase que explica o motivo do link e leva para uma página interna global, na mesma versão e idioma da página atual.

Exemplo para uma página que apresenta typed boundaries:

> Leia **[Conceitos centrais]** para entender os typed boundaries, o que é verificado e como os erros são reportados.

O catálogo declarará essas relações para que links sejam validados, versionados e localizados. A dica aparece antes de “Anterior”/“Próximo”, funciona como desvio opcional e não altera a sequência principal. Cada página terá no máximo três dicas, somente quando ajudarem a resolver uma dúvida natural criada pelo exemplo ou pela recomendação daquela página.

### CLI em evolução

Enquanto a mudança paralela não terminar, exemplos finais de `init` devem ficar centralizados e marcados como pendentes de verificação, não inventados. A revisão de fechamento deve verificar, para cada framework:

- dependências instaladas pelo fluxo;
- opções exibidas pelo `init` e seus valores padrão;
- criação/alteração de `typets.config.json`;
- ativação opcional de validators;
- criação e registro de filtros/handlers globais;
- scripts de build e execução;
- comportamento quando a pessoa recusa uma opção.

## Fluxos e casos de erro

- Os grupos expansíveis devem ser usados inteiramente por teclado, expor estado por `aria-expanded` e preservar itens globais sempre visíveis.
- O layout deve indicar visual e semanticamente o framework ativo em desktop e mobile quando uma página específica estiver aberta.
- A navegação de rodapé deve ter destinos válidos, títulos descritivos, ordem determinística por versão e framework e não pode depender de estado local do navegador.
- Dicas de aprofundamento devem apontar apenas para páginas globais existentes na mesma versão e idioma; não devem criar loops, URLs externas nem mais de três links por página.
- O destino original deve ser validado contra a lista de slugs permitidos; a aplicação não pode montar caminhos arbitrários a partir de parâmetros de retorno.
- Falha de carregamento de Markdown ou slug inexistente não deve deixar uma área vazia; deve produzir estado de erro recuperável e uma navegação segura.
- Conteúdo de uma versão anterior que ainda não tiver uma variante do framework não deve usar, por acidente, conteúdo da versão atual.

## Impacto técnico

### UI/UX

- Sidebar e drawer móvel preservam itens globais e adicionam três grupos expansíveis, sem sobrecarregar o primeiro contato.
- A navegação de cada grupo oferece foco visível, alvos de toque adequados, rótulos acessíveis e estado expandido inequívoco.
- O rodapé usa dois links textuais grandes, com “Anterior”/“Próximo”, título da página de destino e foco visível; em início/fim de fluxo mostra apenas o destino existente.

### Frontend

- Substituir a lista plana de `DOC_SECTIONS` por um catálogo tipado de jornadas, seções e slugs, com funções puras para resolver conteúdo, disponibilidade e fallback.
- Atualizar rotas, resolvers/guards e componentes de layout/página para distinguir de forma explícita slugs globais de slugs específicos por framework.
- Extrair os dados de framework do `GettingStartedComponent` para um catálogo de documentação reutilizado pela navegação e pelas páginas específicas.
- Criar componentes próprios para grupo expansível, escolha de link legado ambíguo e estado de página ausente/indisponível; manter páginas Markdown e a página de performance especializada quando aplicável.
- Criar um componente reutilizável de navegação de documento que resolve vizinhos a partir do catálogo, sem duplicar a ordem nos Markdown.
- Modelar dicas de aprofundamento no catálogo e renderizá-las acima da navegação sequencial, mantendo o Markdown focado no conteúdo principal.
- Reestruturar arquivos de conteúdo de forma que idioma, versão e framework sejam resolvidos deterministicamente.

### Integrações

- O site não chama a CLI. A integração é documental: os comandos, opções e resultados serão revisados contra os repositórios de packages quando o trabalho paralelo finalizar.

## Testes

- Catálogo: resolução de menu por framework, disponibilidade de slug, troca de framework e fallback.
- Rotas: introdução global sem framework, redirecionamento de links legados ambíguos, deep link com framework e retorno seguro ao destino.
- Componentes: grupos expansíveis acessíveis, navegação desktop/móvel, estado do framework ativo e fallback para sua página inicial.
- Fluxo: resolução de anterior/próximo no início, meio e fim das jornadas global e por framework; nenhum destino fora do contexto escolhido.
- Aprofundamento: renderização localizada das dicas, destino na mesma versão e idioma e ausência de links para páginas indisponíveis.
- Conteúdo: testes de presença/rota para todo par idioma × framework × slug declarado.
- Regressão: testes existentes de responsividade dos blocos de comando e página de performance.
- Qualidade: `npm test` e `npm run build` no `ts-typed-site` após a implementação.

## Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| A CLI mudar depois de a documentação ser escrita | Centralizar exemplos da CLI e deixar a revisão final como condição de aceite. |
| Links antigos quebrarem | Resolver rotas globais e específicas separadamente; para destinos ambíguos, oferecer escolha segura. |
| PT e EN divergirem | Declarar conteúdos no mesmo catálogo e validar a matriz de arquivos em teste. |
| Duplicação entre frameworks | Reutilizar conteúdo realmente comum e criar variantes apenas quando o comportamento ou exemplo mudar. |
| URLs de versão futura buscarem conteúdo da versão errada | Resolver caminho de conteúdo pela versão antes de qualquer fallback. |
| Menu e botões de rodapé divergirem | Usar um único catálogo tipado como fonte de ordem, disponibilidade e títulos. |
| Dicas levarem a conteúdo quebrado ou de outra versão | Validar cada relação no catálogo contra slug global, versão e idiomas declarados. |

## Critérios de aceite

- Uma página global abre sem necessidade de escolha; uma página específica abre sempre com um framework explícito.
- Uma URL com versão, framework e slug reproduz exatamente a mesma documentação em uma janela anônima.
- Cada framework mostra somente os tópicos e exemplos aplicáveis, com possibilidade clara de trocar de ambiente.
- Instalação, `init`, configuração e erros descrevem o comportamento real da CLI e dos pacotes ao término da revisão.
- PT e EN cobrem a mesma matriz de páginas declaradas.
- A jornada contém, no mínimo, todos os tópicos do pedido original, com exemplos específicos quando o framework muda o uso.
- Em toda página existe uma navegação de rodapé válida que conduz pelo fluxo prático e, ao fim, para otimização e conceitos; ela respeita versão e framework.
- Onde houver aprofundamento relevante, a página exibe uma dica localizada e contextual, com link interno válido para o conceito correspondente.
- Testes e build SSR passam; não há commit nem push.

## Plano de implementação em alto nível

- [ ] Criar catálogo tipado de páginas globais, frameworks, submenus, slugs e disponibilidade por versão.
- [ ] Implementar rotas canônicas, tratamento de links legados e escolha acessível para destinos ambíguos.
- [ ] Adaptar layout e navegação responsiva com grupos expansíveis por framework.
- [ ] Implementar navegação de rodapé anterior/próximo a partir do catálogo único de documentação.
- [ ] Implementar dicas de aprofundamento contextual a partir do catálogo, antes da navegação sequencial.
- [ ] Implementar a jornada de conteúdo TypeScript puro, Express e NestJS em PT/EN.
- [ ] Migrar páginas conceituais, desempenho, limitações e conteúdo especializado para o novo catálogo.
- [ ] Cobrir a navegação e resolução de conteúdo com testes e build.
- [ ] Esperar a conclusão da CLI e validar todos os comandos/opções antes do fechamento.
