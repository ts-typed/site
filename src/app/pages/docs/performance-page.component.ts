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

const PT: Copy = {
  eyebrow: 'Estudo de runtime · referência local',
  title: 'Segurança que você consegue medir',
  intro: 'A bateria separa validação, projeção, proteção e transporte para mostrar onde o TS Typed custa mais — e onde a estratégia imutável recupera desempenho sem remover cobertura.',
  readTitle: 'Como ler os resultados',
  readBody: 'Cada cartão compara o mesmo trabalho com e sem as garantias de runtime. Os valores são medianas locais; o botão “i” explica fixture, operação e interpretação daquele teste.',
  readFavorable: 'Começamos pelos cenários em que o impacto é pequeno ou a otimização funciona muito bem.',
  readControlled: 'Depois mostramos lotes maiores em que a escolha entre guards e imutabilidade muda o resultado.',
  readCaution: 'Por fim ficam os casos desfavoráveis, que pedem paginação, batch ou streaming antes de qualquer ajuste fino.',
  legendBaseline: 'Sem TS Typed',
  legendRecommended: 'TS Typed · TTOptImmut',
  legendGuard: 'TS Typed · protectValue',
  chartTitle: 'Cenários reais e exagerados',
  chartIntro: 'Mediana em milissegundos por request ou por execução. Menor é melhor. Começamos pelo que funciona bem, passamos pelo impacto controlado e terminamos nos casos que exigem otimização.',
  scenarioGroups: [
    { title: 'Funciona muito bem', intro: 'Respostas pequenas ou DTOs imutáveis têm custo baixo o bastante para uso cotidiano.', scenarios: SCENARIOS.filter((s) => s.title === 'Express · 1 usuário' || s.title === 'Express · 50 usuários otimizado') },
    { title: 'Impacto controlado com a estratégia certa', intro: 'Em lotes maiores, o custo existe, mas selecionar campos públicos e usar TTOptImmut reduz o trabalho.', scenarios: SCENARIOS.filter((s) => s.title === 'TypeORM · proteção do pipeline interno' || s.title === 'TypeORM · retorno público de 10.000 usuários' || s.title === 'Express · 10.000 usuários otimizado' || s.title === 'NestJS · 50 usuários' || s.title === 'NestJS · 10.000 usuários') },
    { title: 'Desfavorável sem otimização', intro: 'A proteção completa fica cara quando cada linha cruza a fronteira individualmente. Use paginação, lotes, streaming ou uma projeção imutável.', scenarios: SCENARIOS.filter((s) => s.title === 'Express · 50 usuários' || s.title === 'Express · 10.000 usuários' || s.title.startsWith('CSV')) },
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
    'A comparação TypeORM mede buscar tudo + delete versus find/select e QueryBuilder/select; todos validam a resposta e executam JSON.stringify.',
    'A comparação de proteção usa a mesma seleção pública e POJO para baseline, TTOptImmut e protectValue; somente a garantia de runtime muda.',
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
  readFavorable: 'We start with cases where impact is small or the optimization works particularly well.',
  readControlled: 'Then we show larger batches where choosing guards or immutability changes the result.',
  readCaution: 'Finally, we show unfavorable cases that need pagination, batching, or streaming before micro-optimizations.',
  legendBaseline: 'Without TS Typed', legendRecommended: 'TS Typed · TTOptImmut', legendGuard: 'TS Typed · protectValue',
  chartTitle: 'Real and intentionally extreme scenarios', chartIntro: 'Median milliseconds per request or execution. Lower is better. We start with favorable cases, then controlled impact, and end with scenarios that require optimization.',
  scenarioGroups: [
    { title: 'Works very well', intro: 'Small responses or immutable DTOs are inexpensive enough for everyday use.', scenarios: SCENARIOS.filter((s) => s.title === 'Express · 1 usuário' || s.title === 'Express · 50 usuários otimizado').map((s) => ({ ...s, title: s.title.replace('usuário', 'user').replace('usuários', 'users').replace('otimizado', 'optimized') })) },
    { title: 'Controlled impact with the right strategy', intro: 'On larger batches, cost exists, but public column selection and TTOptImmut reduce the work.', scenarios: SCENARIOS.filter((s) => s.title === 'TypeORM · proteção do pipeline interno' || s.title === 'TypeORM · retorno público de 10.000 usuários' || s.title === 'Express · 10.000 usuários otimizado' || s.title === 'NestJS · 50 usuários' || s.title === 'NestJS · 10.000 usuários').map((s) => ({ ...s, title: s.title === 'TypeORM · proteção do pipeline interno' ? 'TypeORM · internal pipeline protection' : s.title === 'TypeORM · retorno público de 10.000 usuários' ? 'TypeORM · public return of 10,000 users' : s.title.replace('usuários', 'users').replace('otimizado', 'optimized'), baselineLabel: s.title === 'TypeORM · proteção do pipeline interno' ? 'without TS Typed' : s.title === 'TypeORM · retorno público de 10.000 usuários' ? 'fetch all + delete' : s.baselineLabel, protectedLabel: s.title === 'TypeORM · proteção do pipeline interno' ? 'TS Typed · TTOptImmut' : s.title === 'TypeORM · retorno público de 10.000 usuários' ? 'find · public select' : s.protectedLabel, guardLabel: s.title === 'TypeORM · proteção do pipeline interno' ? 'TS Typed · protectValue' : s.title === 'TypeORM · retorno público de 10.000 usuários' ? 'QueryBuilder · select' : s.guardLabel })) },
    { title: 'Unfavorable without optimization', intro: 'Full protection is expensive when every row crosses the boundary individually. Use pagination, batches, streaming, or immutable projection.', scenarios: SCENARIOS.filter((s) => s.title === 'Express · 50 usuários' || s.title === 'Express · 10.000 usuários' || s.title.startsWith('CSV')).map((s) => ({ ...s, title: s.title.replace('usuários', 'users').replace('linhas', 'rows') })) },
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
  methodItems: ['Node 22.22.3; TypeORM 0.3.28 + better-sqlite3 12.11.1 in memory; 10,000 real UserEntity instances.', 'passwordHash is removed with .map(); every response is checked for size and absence of the sensitive field.', 'The TypeORM protection comparison uses the same public select and POJO for baseline, TTOptImmut, and protectValue; only the runtime guarantee changes.', 'HTTP: five samples of 20 requests, concurrency 4. CSV uses 7 samples after 2 warmups.', 'Express and Nest measure baseline, protectValue, and TTOptImmut; the CSV script compares tsc and ts-typed build.', 'Numbers change with CPU, Node, driver, network, JSON, and object shape. The main bottleneck is object count crossing the boundary.'],
};

@Component({
  selector: 'app-performance-page', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let copy = content;
    <article class="performance-page">
      <header class="performance-hero"><p class="eyebrow">{{ copy.eyebrow }}</p><h1>{{ copy.title }}</h1><p>{{ copy.intro }}</p><div class="performance-readme"><strong>{{ copy.readTitle }}</strong><p>{{ copy.readBody }}</p><div><span>01</span>{{ copy.readFavorable }}</div><div><span>02</span>{{ copy.readControlled }}</div><div><span>03</span>{{ copy.readCaution }}</div></div></header>
      <section class="benchmark-section"><div class="benchmark-heading"><div><p class="eyebrow">01 / {{ copy.chartTitle }}</p><h2>{{ copy.chartTitle }}</h2></div><p>{{ copy.chartIntro }}</p></div><div class="chart-legend"><span><i class="legend-dot baseline"></i>{{ copy.legendBaseline }}</span><span><i class="legend-dot recommended"></i>{{ copy.legendRecommended }}</span><span><i class="legend-dot guard"></i>{{ copy.legendGuard }}</span></div>@for (group of copy.scenarioGroups; track group.title; let groupIndex = $index) {<section class="scenario-group" [class.scenario-group-caution]="groupIndex === 2"><div class="scenario-group-heading"><span class="scenario-group-number">0{{ groupIndex + 1 }}</span><div><h3>{{ group.title }}</h3><p>{{ group.intro }}</p></div></div><div class="scenario-grid">@for (scenario of group.scenarios; track scenario.title) {<section class="scenario-card"><div class="scenario-card-header"><div><h3>{{ scenario.title }}</h3><p>{{ scenario.description }}</p></div><button type="button" class="info-button" [attr.aria-label]="'Info: ' + scenario.title" [attr.aria-expanded]="detailsOpen === scenario.title" (click)="toggleDetails(scenario.title)">i</button></div><div class="scenario-bars"><div class="bar-row"><span>{{ scenario.baselineLabel ?? copy.legendBaseline }}</span><div class="bar-track"><div class="bar-fill baseline" [style.width.%]="barWidth(scenario.baseline, scenario)" ></div></div><strong>{{ format(scenario.baseline) }}</strong></div><div class="bar-row"><span>{{ scenario.protectedLabel ?? copy.legendRecommended }}</span><div class="bar-track"><div class="bar-fill recommended" [style.width.%]="barWidth(scenario.recommended, scenario)" ></div></div><strong>{{ format(scenario.recommended) }}</strong></div>@if (scenario.normalGuard) {<div class="bar-row"><span>{{ scenario.guardLabel ?? copy.legendGuard }}</span><div class="bar-track"><div class="bar-fill guard" [style.width.%]="barWidth(scenario.normalGuard, scenario)" ></div></div><strong>{{ format(scenario.normalGuard) }}</strong></div>}</div><p class="scenario-takeaway">{{ scenario.takeaway }}</p>@if (detailsOpen === scenario.title) {<div class="scenario-details"><strong>{{ isPortuguese ? 'Como foi feito' : 'How it was measured' }}</strong><p>{{ scenarioDetails(scenario) }}</p></div>}</section>}</div></section>}</section>
      <section class="benchmark-section"><div class="benchmark-heading"><div><p class="eyebrow">02 / {{ copy.runtimeTitle }}</p><h2>{{ copy.runtimeTitle }}</h2></div><p>{{ copy.runtimeIntro }}</p></div><div class="runtime-grid">@for (item of copy.runtime; track item.label) {<div class="runtime-card"><span>{{ item.label }}</span><strong>{{ item.value }}</strong><small>{{ item.detail }}</small></div>}</div></section>
      <section class="benchmark-section"><div class="benchmark-heading"><div><p class="eyebrow">03 / {{ copy.guidanceTitle }}</p><h2>{{ copy.guidanceTitle }}</h2></div></div><div class="guidance-grid">@for (item of copy.guidance; track item.title) {<article><span class="guidance-mark">✓</span><div><h3>{{ item.title }}</h3><p>{{ item.body }}</p></div></article>}</div></section>
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
