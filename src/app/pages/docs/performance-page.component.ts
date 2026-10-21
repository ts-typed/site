import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface Scenario {
  readonly title: string;
  readonly description: string;
  readonly baseline: number;
  readonly baselineLabel?: string;
  readonly recommended: number;
  readonly normalGuard?: number;
  readonly guardLabel?: string;
  readonly protectedLabel?: string;
  readonly unit: 'ms' | 'req/s';
  readonly takeaway: string;
  readonly details: { readonly pt: string; readonly en: string };
}

interface ScenarioGroup {
  readonly title: string;
  readonly intro: string;
  readonly scenarios: readonly Scenario[];
}

interface Copy {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly readTitle: string;
  readonly readBody: string;
  readonly readFavorable: string;
  readonly readControlled: string;
  readonly readCaution: string;
  readonly legendBaseline: string;
  readonly legendRecommended: string;
  readonly legendGuard: string;
  readonly chartTitle: string;
  readonly chartIntro: string;
  readonly scenarioGroups: readonly ScenarioGroup[];
  readonly runtimeTitle: string;
  readonly runtimeIntro: string;
  readonly runtime: readonly { label: string; value: string; detail: string }[];
  readonly guidanceTitle: string;
  readonly guidance: readonly { title: string; body: string }[];
  readonly methodTitle: string;
  readonly methodBody: string;
  readonly methodItems: readonly string[];
}

const SCENARIOS: readonly Scenario[] = [
  { title: 'TypeORM · proteção do pipeline interno', description: 'Operação local sem HTTP: seleção pública, POJO, validação e JSON; varia apenas a proteção de runtime.', baseline: 8.691, baselineLabel: 'sem TS Typed', recommended: 19.057, protectedLabel: 'TS Typed · TTOptImmut', normalGuard: 48.928, guardLabel: 'TS Typed · protectValue', unit: 'ms', takeaway: 'TTOptImmut ficou 2,2x acima do baseline e 2,6x mais rápido que guards mutáveis.', details: { pt: 'Este é um microbenchmark interno com SQLite em memória. Não inclui servidor, socket, concorrência nem parsing HTTP. Os três caminhos usam a mesma seleção pública, convertem entities para POJO, conferem a ausência de passwordHash e serializam. Só a proteção muda.', en: 'This is an internal microbenchmark with in-memory SQLite. It does not include a server, socket, concurrency, or HTTP parsing. All three paths use the same public select, convert entities to POJOs, check that passwordHash is absent, and serialize. Only protection changes.' } },
  { title: 'TypeORM · retorno público de 10.000 usuários', description: 'Pipeline interno sem HTTP: buscar tudo e remover a senha versus selecionar somente colunas públicas.', baseline: 20.643, baselineLabel: 'buscar tudo + delete', recommended: 14.633, protectedLabel: 'find · select público', normalGuard: 14.111, guardLabel: 'QueryBuilder · select', unit: 'ms', takeaway: 'Selecionar somente as colunas públicas reduziu o pipeline interno em aproximadamente 31,6%.', details: { pt: 'Cada medição buscou 10 mil usuários, garantiu a ausência de passwordHash, validou o UserResponse[] e executou JSON.stringify. A consulta pública não hidrata o segredo. Este cartão não é comparável diretamente à latência HTTP do Express.', en: 'Each measurement fetched 10,000 users, checked that passwordHash was absent, validated UserResponse[], and ran JSON.stringify. The public query never hydrates the secret. This card is not directly comparable to Express HTTP latency.' } },
  { title: 'Express · 1 usuário', description: 'Request local com um item; a diferença fica dentro do ruído do socket.', baseline: .811, recommended: .650, protectedLabel: 'TS Typed', unit: 'ms', takeaway: 'Para respostas pequenas, a validação não é o fator dominante.', details: { pt: 'O request cria e devolve um único usuário. O resultado typed ficou ligeiramente menor que o baseline, uma diferença dentro do ruído normal de uma medição local.', en: 'The request creates and returns one user. The typed result was slightly lower than baseline, which is normal noise for a local measurement.' } },
  { title: 'Express · 50 usuários otimizado', description: 'Entity → .map() sem passwordHash → DTO imutável → JSON.', baseline: 1.193, recommended: 1.395, normalGuard: 2.120, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'Impacto controlado: +17% no cenário focado, mantendo validação e imutabilidade.', details: { pt: 'TypeORM materializa as entidades, o map remove passwordHash, o lote é validado uma vez e congelado. O caminho normal com guards chegou a 2,12 ms.', en: 'TypeORM materializes entities, map removes passwordHash, and the batch is validated once and frozen. The normal guarded path reached 2.12 ms.' } },
  { title: 'Express · 50 usuários', description: 'A bateria ampla usa a proteção normal em um lote de 50 usuários.', baseline: .481, recommended: 3.473, protectedLabel: 'TS Typed', unit: 'ms', takeaway: 'Quando o lote é pequeno, ainda funciona, mas o caminho otimizado deve ser preferido.', details: { pt: 'Este resultado vem da bateria ampla, que mantém a proteção normal e inclui o custo das fronteiras instrumentadas por item. Compare com o cenário TTOptImmut acima.', en: 'This result comes from the broad battery, which keeps normal protection and includes the cost of per-item instrumented boundaries. Compare it with the TTOptImmut scenario above.' } },
  { title: 'Express · 10.000 usuários', description: 'Request HTTP completa, com 20 requests concorrentes e resposta JSON grande.', baseline: 52.15, recommended: 245.13, normalGuard: 245.13, protectedLabel: 'TS Typed · protectValue', unit: 'ms', takeaway: 'A proteção mutável adicionou aproximadamente 4,7x à latência HTTP do baseline.', details: { pt: 'Aqui entram servidor Express, socket local, concorrência 4, TypeORM, projeção, proteção mutável, serialização e parsing da resposta. É uma latência estimada por request, não o tempo de uma operação interna isolada.', en: 'This includes Express, local sockets, concurrency 4, TypeORM, projection, mutable protection, serialization, and response parsing. It is estimated per-request latency, not an isolated internal operation.' } },
  { title: 'Express · 10.000 usuários otimizado', description: 'Request HTTP completa usando TTOptImmut para validar e congelar o POJO de saída.', baseline: 52.15, recommended: 124.75, normalGuard: 245.13, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'TTOptImmut foi aproximadamente 1,96x mais rápido que protectValue no HTTP.', details: { pt: 'A projeção gera POJOs, valida o grafo e usa Object.freeze em vez de instalar milhares de accessors. O cenário inclui o custo completo do request e é comparável ao cartão Express normal acima.', en: 'The projection creates POJOs, validates the graph, and uses Object.freeze instead of installing thousands of accessors. This scenario includes the complete request cost and is comparable to the Express card above.' } },
  { title: 'NestJS · 50 usuários', description: 'Controller Nest com filtro StrictTypeError no caminho protegido.', baseline: 1.030, recommended: 1.380, normalGuard: 2.160, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'Nest e Express ficaram próximos; o adaptador HTTP não é o gargalo.', details: { pt: 'O controller usa o filtro real de exceções e a mesma projeção de usuários. A diferença pequena mostra que o custo está no runtime por objeto, não no NestJS.', en: 'The controller uses the real exception filter and the same user projection. The small difference shows that per-object runtime work, not NestJS, is the bottleneck.' } },
  { title: 'NestJS · 10.000 usuários', description: 'Request HTTP Nest completa, filtro de erros, projeção e resposta com 10.000 itens.', baseline: 55.61, recommended: 124.22, normalGuard: 249.76, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'Nest e Express ficaram próximos; TTOptImmut reduziu aproximadamente pela metade o custo mutável.', details: { pt: 'O mesmo stress test do Express foi repetido no NestJS. Os valores incluem servidor, concorrência, filtro de erros, serialização e parsing HTTP; não devem ser comparados diretamente ao pipeline interno TypeORM.', en: 'The same Express stress test was repeated in NestJS. Values include the server, concurrency, error filter, serialization, and HTTP parsing; they should not be compared directly to the internal TypeORM pipeline.' } },
  { title: 'CSV · 1.000 linhas', description: 'Parse, validação de e-mail, remoção de passwordHash e conversão pública.', baseline: .493, recommended: 21.919, protectedLabel: 'TS Typed', unit: 'ms', takeaway: 'Validações repetidas por linha crescem quase linearmente.', details: { pt: 'Cada linha cria um CsvRow, instancia Email, cria o PublicRow e cruza várias fronteiras instrumentadas. O script não tem I/O para diluir esse custo.', en: 'Each row creates CsvRow, instantiates Email, creates PublicRow, and crosses multiple instrumented boundaries. The script has no I/O to dilute the cost.' } },
  { title: 'CSV · 10.000 linhas', description: 'A mesma pipeline com dez vezes mais linhas.', baseline: 3.758, recommended: 201.496, protectedLabel: 'TS Typed', unit: 'ms', takeaway: 'Evite cópias intermediárias e considere streaming em arquivos grandes.', details: { pt: 'Além do trabalho por linha, o retorno final ConversionResult percorre o array completo. Uma API de lote poderia validar e congelar apenas uma vez no fim.', en: 'Besides per-row work, the final ConversionResult walks the full array. A batch API could validate and freeze only once at the end.' } },
  { title: 'CSV · 50.000 linhas', description: 'Teste de estresse intencional para expor o custo acumulado.', baseline: 18.267, recommended: 1142.554, protectedLabel: 'TS Typed', unit: 'ms', takeaway: 'O custo typed cresce com o número de fronteiras, não com o tamanho textual do CSV.', details: { pt: 'Este é o pior caso: 50 mil iterações e várias proteções por iteração. Para esse perfil, use processamento em lotes, streaming e uma fronteira de validação em batch.', en: 'This is the worst case: 50,000 iterations and several protections per iteration. Use batches, streaming, and one batch validation boundary for this profile.' } },
];

// The page intentionally shows only the user-facing scenarios below. The
// larger internal TypeORM decomposition remains in the repository benchmark
// report, but is not mixed into this API-focused comparison.
const DISPLAY_SCENARIOS: readonly Scenario[] = [
  { title: 'Express · 1 item', description: 'Request HTTP local com um único usuário.', baseline: 1.074, recommended: .943, normalGuard: 1.007, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'Para um item, a diferença fica dentro do ruído normal do request.', details: { pt: 'Inclui 20 requests, concorrência 4, servidor Express, JSON e parsing.', en: 'Includes 20 requests, concurrency 4, the Express server, JSON, and parsing.' } },
  { title: 'Express · 50 itens', description: 'Request HTTP com o tamanho mais comum para APIs paginadas.', baseline: 1.010, recommended: 1.357, normalGuard: 1.956, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'Cenário prioritário: TTOptImmut mantém o impacto baixo; guards mutáveis custam mais.', details: { pt: 'O baseline não usa runtime do ts-typed. Os caminhos typed validam a resposta.', en: 'The baseline has no ts-typed runtime. Typed paths validate the response.' } },
  { title: 'Express · 1.000 itens', description: 'Request HTTP de lote médio para expor o crescimento do custo.', baseline: 5.375, recommended: 10.911, normalGuard: 22.950, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'O custo cresce com o número de objetos; a estratégia imutável é aproximadamente 2x mais rápida.', details: { pt: 'Use paginação antes de chegar a este volume.', en: 'Paginate before reaching this volume.' } },
  { title: 'Express · 10.000 itens', description: 'Stress test HTTP deliberado com resposta JSON grande.', baseline: 52.519, recommended: 123.002, normalGuard: 242.634, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'Paginação é mais importante que qualquer micro-otimização nesse volume.', details: { pt: 'TTOptImmut ficou aproximadamente 2x mais rápido que protectValue.', en: 'TTOptImmut was approximately 2x faster than protectValue.' } },
  { title: 'NestJS · 1 item', description: 'Request HTTP Nest com um único usuário.', baseline: .944, recommended: .974, normalGuard: .921, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'A diferença é ruído de uma resposta pequena; Nest não é o gargalo.', details: { pt: 'Com um item, o custo do runtime é quase indistinguível do ruído HTTP.', en: 'With one item, runtime cost is nearly indistinguishable from HTTP noise.' } },
  { title: 'NestJS · 50 itens', description: 'Request HTTP Nest com um lote comum de resposta.', baseline: .943, recommended: 1.471, normalGuard: 1.979, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'O cenário prioritário continua abaixo de 2 ms com a estratégia imutável.', details: { pt: 'Nest e Express ficam próximos neste tamanho.', en: 'Nest and Express stay close at this size.' } },
  { title: 'NestJS · 1.000 itens', description: 'Request HTTP Nest de lote médio.', baseline: 5.188, recommended: 10.955, normalGuard: 22.807, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'A proteção imutável custa cerca da metade dos guards mutáveis.', details: { pt: 'O trabalho dominante é percorrer e proteger cada objeto.', en: 'The dominant work is traversing and protecting each object.' } },
  { title: 'NestJS · 10.000 itens', description: 'Stress test HTTP Nest com 10.000 usuários.', baseline: 55.810, recommended: 124.662, normalGuard: 246.119, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'O gargalo está no volume de objetos, não no adaptador NestJS.', details: { pt: 'Paginação deve ser a primeira otimização.', en: 'Pagination should be the first optimization.' } },
  { title: 'CSV · 1.000 itens', description: 'Manipulação, edição, validação e conversão de CSV.', baseline: .477, recommended: 18.413, protectedLabel: 'TS Typed', unit: 'ms', takeaway: 'A proteção por linha aparece mais no script sem I/O para diluir o custo.', details: { pt: 'O teste mede apenas o trabalho em memória.', en: 'The test measures in-memory work only.' } },
  { title: 'CSV · 10.000 itens', description: 'A mesma manipulação de CSV em um lote dez vezes maior.', baseline: 3.343, recommended: 197.251, protectedLabel: 'TS Typed', unit: 'ms', takeaway: 'Para CSV grande, use batch validation, streaming e evite cópias intermediárias.', details: { pt: 'Cada linha cruza várias fronteiras instrumentadas.', en: 'Each row crosses several instrumented boundaries.' } },
];

const PT: Copy = {
  eyebrow: 'Estudo de runtime · referência local',
  title: 'Segurança que você consegue medir',
  intro: 'A bateria separa validação, projeção, proteção e transporte para mostrar onde o TS Typed custa mais — e onde a estratégia imutável recupera desempenho sem remover cobertura.',
  readTitle: 'Como ler os resultados',
  readBody: 'Cada cartão compara o mesmo trabalho com e sem as garantias de runtime. Os valores são medianas locais; o botão “i” explica fixture, operação e interpretação daquele teste.',
  readFavorable: 'Começamos pelos casos prioritários de 1 e 50 itens.',
  readControlled: 'Depois mostramos o crescimento em 1.000 itens.',
  readCaution: 'Por fim ficam os stress tests de 10.000 itens e os dois cenários de CSV.',
  legendBaseline: 'Sem TS Typed',
  legendRecommended: 'TS Typed · TTOptImmut',
  legendGuard: 'TS Typed · protectValue',
  chartTitle: 'Comparações por tamanho de lote',
  chartIntro: 'Mediana em milissegundos. Cada cartão compara baseline, TTOptImmut e protectValue; CSV compara tsc normal com o build typed. Menor é melhor.',
  scenarioGroups: [
    { title: 'Casos prioritários: 1 a 50 itens', intro: 'A maioria das APIs trabalha nesses lotes. Aqui o impacto tende a ser pequeno e TTOptImmut é a opção mais eficiente para DTOs de saída.', scenarios: DISPLAY_SCENARIOS.filter((s) => /· (1|50) item/.test(s.title)) },
    { title: 'Lotes médios: 1.000 itens', intro: 'Um cenário de crescimento para revelar o custo por objeto antes do stress test.', scenarios: DISPLAY_SCENARIOS.filter((s) => s.title.includes('1.000')) },
    { title: 'Stress test: 10.000 itens', intro: 'Casos deliberadamente grandes. Use paginação, batch ou streaming antes de qualquer micro-otimização.', scenarios: DISPLAY_SCENARIOS.filter((s) => s.title.includes('10.000')) },
  ],
  runtimeTitle: 'Custo isolado do runtime',
  runtimeIntro: 'Sem banco, HTTP ou serialização: apenas a operação de validação/proteção.',
  runtime: [
    { label: 'assertValue(string)', value: '42,6 ns', detail: 'Validação primitiva.' },
    { label: 'UserResponse', value: '567 ns', detail: 'Um DTO de saída.' },
    { label: 'UserResponse[10.000]', value: '4,99 ms', detail: 'Validação de array.' },
    { label: '10.000 · guards / TTOptImmut', value: '44,83 / 10,58 ms', detail: 'Projeção + proteção; 4,2x de diferença.' },
  ],
  guidanceTitle: 'Como usar sem pagar custo desnecessário',
  guidance: [
    { title: 'Paginação primeiro', body: 'Não trate 10.000 itens como contrato normal de API. Limite páginas, use cursor, selecione campos e faça streaming em pipelines.' },
    { title: 'TTOptImmut no DTO de saída', body: 'Para POJOs que não serão alterados, valide e congele o lote com TTOptImmut<IUserData[]>. Object.keys, spread e structuredClone continuam funcionando.' },
    { title: 'protectValue nas entities', body: 'Entities TypeORM, classes mutáveis, Date, Map e Set precisam continuar mutáveis e devem usar a proteção normal.' },
    { title: 'Cache já aplicado', body: 'O compiler 0.1.28 reutiliza metadados do schema durante uma travessia com WeakMap. Isso reduz reflexão repetida sem compartilhar estado entre requests.' },
  ],
  methodTitle: 'Ambiente, metodologia e limites',
  methodBody: 'São medições locais de referência, não SLA. Reexecute no hardware e no formato de resposta da sua aplicação.',
  methodItems: [
    'Node 22.22.3; TypeORM 0.3.28 + better-sqlite3 12.11.1 em memória; 10.000 UserEntity reais.',
    'APIs medem requests completas com 20 requests por amostra e concorrência 4; os valores são latência estimada por request.',
    'CSV mede manipulação e edição em memória com tsc normal versus build typed.',
    'passwordHash é removido por .map(); cada resposta é verificada para garantir o tamanho e a ausência do campo sensível.',
    'HTTP: cinco amostras de 20 requests, concorrência 4. A bateria CSV usa 7 amostras depois de 2 warmups.',
    'Express e Nest medem baseline, protectValue e TTOptImmut; o script CSV compara tsc e ts-typed build.',
    'Os números mudam com CPU, Node, driver, rede, JSON e shape do objeto. O gargalo principal é o número de objetos atravessando a fronteira.',
  ],
};

const EN: Copy = {
  ...PT,
  eyebrow: 'Runtime study · local reference',
  title: 'Security you can measure',
  intro: 'The battery separates validation, projection, protection, and transport to show where TS Typed costs more — and where the immutable strategy recovers performance without dropping coverage.',
  readTitle: 'How to read the results',
  readBody: 'Each card compares the same work with and without runtime guarantees. Values are local medians; the “i” button explains the fixture, operation, and interpretation for that test.',
  readFavorable: 'We start with the priority cases of 1 and 50 items.',
  readControlled: 'Then we show growth at 1,000 items.',
  readCaution: 'Finally, we show 10,000-item stress tests and the two CSV scenarios.',
  legendBaseline: 'Without TS Typed', legendRecommended: 'TS Typed · TTOptImmut', legendGuard: 'TS Typed · protectValue',
  chartTitle: 'Comparisons by batch size', chartIntro: 'Median milliseconds. Each card compares baseline, TTOptImmut, and protectValue; CSV compares normal tsc with the typed build. Lower is better.',
  scenarioGroups: [
    { title: 'Priority cases: 1 to 50 items', intro: 'Most APIs work in these batch sizes. Impact is usually small and TTOptImmut is the efficient choice for output DTOs.', scenarios: DISPLAY_SCENARIOS.filter((s) => /· (1|50) item/.test(s.title)).map((s) => ({ ...s, title: s.title.replace('itens', 'items') })) },
    { title: 'Medium batches: 1,000 items', intro: 'A growth scenario that reveals per-object cost before the stress test.', scenarios: DISPLAY_SCENARIOS.filter((s) => s.title.includes('1.000')).map((s) => ({ ...s, title: s.title.replace('itens', 'items') })) },
    { title: 'Stress test: 10,000 items', intro: 'Deliberately large cases. Use pagination, batches, or streaming before micro-optimizations.', scenarios: DISPLAY_SCENARIOS.filter((s) => s.title.includes('10.000')).map((s) => ({ ...s, title: s.title.replace('itens', 'items') })) },
  ],
  runtimeTitle: 'Isolated runtime cost', runtimeIntro: 'No database, HTTP, or serialization: only validation/protection work.',
  runtime: [
    { label: 'assertValue(string)', value: '42.6 ns', detail: 'Primitive validation.' }, { label: 'UserResponse', value: '567 ns', detail: 'One output DTO.' }, { label: 'UserResponse[10,000]', value: '4.99 ms', detail: 'Array validation.' }, { label: '10,000 · guards / TTOptImmut', value: '44.83 / 10.58 ms', detail: 'Projection + protection; 4.2x difference.' },
  ],
  guidanceTitle: 'How to avoid unnecessary cost', guidance: [
    { title: 'Paginate first', body: 'Do not treat 10,000 items as a normal API contract. Bound pages, use cursors, select fields, and stream large pipelines.' },
    { title: 'TTOptImmut for output DTOs', body: 'For POJOs that will not change, validate and freeze the batch with TTOptImmut<IUserData[]>. Object.keys, spread, and structuredClone still work.' },
    { title: 'protectValue for entities', body: 'TypeORM entities, mutable classes, Date, Map, and Set must stay mutable and use the normal protection path.' },
    { title: 'Cache already applied', body: 'Compiler 0.1.28 reuses schema metadata during one traversal with a WeakMap, reducing repeated reflection without sharing state between requests.' },
  ],
  methodTitle: 'Environment, methodology, and limits', methodBody: 'These are local reference measurements, not an SLA. Re-run them with your hardware and response shape.',
  methodItems: ['Node 22.22.3; TypeORM 0.3.28 + better-sqlite3 12.11.1 in memory; HTTP scenarios use real Express and Nest servers.', 'API scenarios use five samples of 20 requests with concurrency 4; values are estimated latency per request.', 'CSV measures in-memory manipulation and editing with normal tsc versus the typed build.', 'Express and Nest compare baseline, TTOptImmut, and protectValue. CSV compares baseline and typed.', 'Numbers change with CPU, Node, driver, network, JSON, and object shape. The main bottleneck is object count crossing the boundary.'],
};

@Component({
  selector: 'app-performance-page', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let copy = content;
    <article class="performance-page">
      <header class="performance-hero"><p class="eyebrow">{{ copy.eyebrow }}</p><h1>{{ copy.title }}</h1><p>{{ copy.intro }}</p><div class="performance-readme"><strong>{{ copy.readTitle }}</strong><p>{{ copy.readBody }}</p><div><span>01</span>{{ copy.readFavorable }}</div><div><span>02</span>{{ copy.readControlled }}</div><div><span>03</span>{{ copy.readCaution }}</div></div></header>
      <section class="benchmark-section"><div class="benchmark-heading"><div><p class="eyebrow">01 / {{ copy.chartTitle }}</p><h2>{{ copy.chartTitle }}</h2></div><p>{{ copy.chartIntro }}</p></div><div class="chart-legend"><span><i class="legend-dot baseline"></i>{{ copy.legendBaseline }}</span><span><i class="legend-dot recommended"></i>{{ copy.legendRecommended }}</span><span><i class="legend-dot guard"></i>{{ copy.legendGuard }}</span></div>@for (group of copy.scenarioGroups; track group.title; let groupIndex = $index) {<section class="scenario-group" [class.scenario-group-caution]="groupIndex === 2"><div class="scenario-group-heading"><span class="scenario-group-number">0{{ groupIndex + 1 }}</span><div><h3>{{ group.title }}</h3><p>{{ group.intro }}</p></div></div><div class="scenario-grid">@for (scenario of group.scenarios; track scenario.title) {<section class="scenario-card"><div class="scenario-card-header"><div><h3>{{ scenario.title }}</h3><p>{{ scenario.description }}</p></div><button type="button" class="info-button" [attr.aria-label]="'Info: ' + scenario.title" [attr.aria-expanded]="detailsOpen === scenario.title" (click)="toggleDetails(scenario.title)">i</button></div><div class="scenario-bars"><div class="bar-row"><span>{{ scenario.baselineLabel ?? copy.legendBaseline }}</span><div class="bar-track"><div class="bar-fill baseline" [style.width.%]="barWidth(scenario.baseline, scenario)" ></div></div><strong>{{ format(scenario.baseline) }}</strong></div><div class="bar-row"><span>{{ scenario.protectedLabel ?? copy.legendRecommended }}</span><div class="bar-track"><div class="bar-fill recommended" [style.width.%]="barWidth(scenario.recommended, scenario)" ></div></div><strong>{{ format(scenario.recommended) }}</strong></div>@if (scenario.normalGuard) {<div class="bar-row"><span>{{ scenario.guardLabel ?? copy.legendGuard }}</span><div class="bar-track"><div class="bar-fill guard" [style.width.%]="barWidth(scenario.normalGuard, scenario)" ></div></div><strong>{{ format(scenario.normalGuard) }}</strong></div>}</div><p class="scenario-takeaway">{{ scenario.takeaway }}</p>@if (detailsOpen === scenario.title) {<div class="scenario-details"><strong>{{ isPortuguese ? 'Como foi feito' : 'How it was measured' }}</strong><p>{{ scenarioDetails(scenario) }}</p></div>}</section>}</div></section>}</section>
      <section class="benchmark-section"><div class="benchmark-heading"><div><p class="eyebrow">02 / {{ copy.guidanceTitle }}</p><h2>{{ copy.guidanceTitle }}</h2></div></div><div class="guidance-grid">@for (item of copy.guidance; track item.title) {<article><span class="guidance-mark">✓</span><div><h3>{{ item.title }}</h3><p>{{ item.body }}</p></div></article>}</div></section>
      <details class="method-panel"><summary>{{ copy.methodTitle }}</summary><div><p>{{ copy.methodBody }}</p><ul>@for (item of copy.methodItems; track item) {<li>{{ item }}</li>}</ul></div></details>
    </article>
  `,
})
export class PerformancePageComponent {
  private readonly translate = inject(TranslateService);
  public get content(): Copy { return this.translate.getCurrentLang() === 'pt' ? PT : EN; }
  public get isPortuguese(): boolean { return this.translate.getCurrentLang() === 'pt'; }
  public scenarioDetails(scenario: Scenario): string { return this.isPortuguese ? scenario.details.pt : scenario.details.en; }
  public detailsOpen: string | null = null;
  public toggleDetails(title: string): void { this.detailsOpen = this.detailsOpen === title ? null : title; }
  public barWidth(value: number, scenario: Scenario): number { const max = Math.max(scenario.baseline, scenario.recommended, scenario.normalGuard ?? 0); return Math.max(5, (value / max) * 100); }
  public format(value: number): string { return `${value.toLocaleString(this.translate.getCurrentLang() === 'pt' ? 'pt-BR' : 'en-US', { maximumFractionDigits: 3 })} ms`; }
}
