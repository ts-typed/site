import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface Scenario {
  readonly title: string;
  readonly description: string;
  readonly baseline: number;
  readonly recommended: number;
  readonly normalGuard?: number;
  readonly protectedLabel?: string;
  readonly unit: 'ms' | 'req/s';
  readonly takeaway: string;
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
  { title: 'Express · 1 usuário', description: 'Request local com um item; a diferença fica dentro do ruído do socket.', baseline: .811, recommended: .650, protectedLabel: 'TS Typed', unit: 'ms', takeaway: 'Para respostas pequenas, a validação não é o fator dominante.' },
  { title: 'Express · 50 usuários otimizado', description: 'Entity → .map() sem passwordHash → DTO imutável → JSON.', baseline: 1.193, recommended: 1.395, normalGuard: 2.120, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'Impacto controlado: +17% no cenário focado, mantendo validação e imutabilidade.' },
  { title: 'Express · 50 usuários', description: 'A bateria ampla usa a proteção normal em um lote de 50 usuários.', baseline: .481, recommended: 3.473, protectedLabel: 'TS Typed', unit: 'ms', takeaway: 'Quando o lote é pequeno, ainda funciona, mas o caminho otimizado deve ser preferido.' },
  { title: 'Express · 10.000 usuários', description: 'Cenário extremo com TypeORM, projeção e serialização de uma resposta grande.', baseline: 5.455, recommended: 311.306, normalGuard: 311.306, protectedLabel: 'TS Typed', unit: 'ms', takeaway: 'Paginação é mais importante que qualquer micro-otimização nesse volume.' },
  { title: 'Express · 10.000 usuários otimizado', description: 'Mesmo fluxo, usando TTOptImmut para validar e congelar o POJO de saída.', baseline: 5.455, recommended: 198.085, normalGuard: 311.306, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'A estratégia imutável foi 1,57x mais rápida que o caminho typed normal.' },
  { title: 'NestJS · 50 usuários', description: 'Controller Nest com filtro StrictTypeError no caminho protegido.', baseline: 1.030, recommended: 1.380, normalGuard: 2.160, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'Nest e Express ficaram próximos; o adaptador HTTP não é o gargalo.' },
  { title: 'NestJS · 10.000 usuários', description: 'Controller Nest, filtro de erros, projeção e resposta com 10.000 itens.', baseline: 56.282, recommended: 117.379, normalGuard: 258.500, protectedLabel: 'TS Typed · TTOptImmut', unit: 'ms', takeaway: 'TTOptImmut reduz aproximadamente pela metade o custo da proteção mutável.' },
  { title: 'CSV · 1.000 linhas', description: 'Parse, validação de e-mail, remoção de passwordHash e conversão pública.', baseline: .493, recommended: 21.919, protectedLabel: 'TS Typed', unit: 'ms', takeaway: 'Validações repetidas por linha crescem quase linearmente.' },
  { title: 'CSV · 10.000 linhas', description: 'A mesma pipeline com dez vezes mais linhas.', baseline: 3.758, recommended: 201.496, protectedLabel: 'TS Typed', unit: 'ms', takeaway: 'Evite cópias intermediárias e considere streaming em arquivos grandes.' },
  { title: 'CSV · 50.000 linhas', description: 'Teste de estresse intencional para expor o custo acumulado.', baseline: 18.267, recommended: 1142.554, protectedLabel: 'TS Typed', unit: 'ms', takeaway: 'O custo typed cresce com o número de fronteiras, não com o tamanho textual do CSV.' },
];

const PT: Copy = {
  eyebrow: 'Estudo de runtime · referência local',
  title: 'Segurança que você consegue medir',
  intro: 'A bateria separa validação, projeção, proteção e transporte para mostrar onde o TS Typed custa mais — e onde a estratégia imutável recupera desempenho sem remover cobertura.',
  legendBaseline: 'Sem TS Typed',
  legendRecommended: 'TS Typed · TTOptImmut',
  legendGuard: 'TS Typed · protectValue',
  chartTitle: 'Cenários reais e exagerados',
  chartIntro: 'Mediana em milissegundos por request ou por execução. Menor é melhor. Começamos pelo que funciona bem, passamos pelo impacto controlado e terminamos nos casos que exigem otimização.',
  scenarioGroups: [
    { title: 'Funciona muito bem', intro: 'Respostas pequenas ou DTOs imutáveis têm custo baixo o bastante para uso cotidiano.', scenarios: SCENARIOS.filter((s) => s.title === 'Express · 1 usuário' || s.title === 'Express · 50 usuários otimizado') },
    { title: 'Impacto controlado com a estratégia certa', intro: 'Em lotes maiores, o custo existe, mas TTOptImmut reduz bastante o caminho de guards mutáveis.', scenarios: SCENARIOS.filter((s) => s.title === 'Express · 10.000 usuários otimizado' || s.title === 'NestJS · 50 usuários' || s.title === 'NestJS · 10.000 usuários') },
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
  legendBaseline: 'Without TS Typed', legendRecommended: 'TS Typed · TTOptImmut', legendGuard: 'TS Typed · protectValue',
  chartTitle: 'Real and intentionally extreme scenarios', chartIntro: 'Median milliseconds per request or execution. Lower is better. We start with favorable cases, then controlled impact, and end with scenarios that require optimization.',
  scenarioGroups: [
    { title: 'Works very well', intro: 'Small responses or immutable DTOs are inexpensive enough for everyday use.', scenarios: SCENARIOS.filter((s) => s.title === 'Express · 1 usuário' || s.title === 'Express · 50 usuários otimizado').map((s) => ({ ...s, title: s.title.replace('usuário', 'user').replace('usuários', 'users').replace('otimizado', 'optimized') })) },
    { title: 'Controlled impact with the right strategy', intro: 'On larger batches, cost exists, but TTOptImmut substantially reduces the mutable-guard path.', scenarios: SCENARIOS.filter((s) => s.title === 'Express · 10.000 usuários otimizado' || s.title === 'NestJS · 50 usuários' || s.title === 'NestJS · 10.000 usuários').map((s) => ({ ...s, title: s.title.replace('usuários', 'users').replace('otimizado', 'optimized') })) },
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
  methodItems: ['Node 22.22.3; TypeORM 0.3.28 + better-sqlite3 12.11.1 in memory; 10,000 real UserEntity instances.', 'passwordHash is removed with .map(); every response is checked for size and absence of the sensitive field.', 'HTTP: five samples of 20 requests, concurrency 4. CSV uses 7 samples after 2 warmups.', 'Express and Nest measure baseline, protectValue, and TTOptImmut; the CSV script compares tsc and ts-typed build.', 'Numbers change with CPU, Node, driver, network, JSON, and object shape. The main bottleneck is object count crossing the boundary.'],
};

@Component({
  selector: 'app-performance-page', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let copy = content;
    <article class="performance-page">
      <header class="performance-hero"><p class="eyebrow">{{ copy.eyebrow }}</p><h1>{{ copy.title }}</h1><p>{{ copy.intro }}</p><div class="performance-kpis"><div><strong>4,2x</strong><span>TTOptImmut vs guards</span></div><div><strong>57x</strong><span>Express · 10.000</span></div><div><strong>42,6 ns</strong><span>string validation</span></div></div></header>
      <section class="benchmark-section"><div class="benchmark-heading"><div><p class="eyebrow">01 / {{ copy.chartTitle }}</p><h2>{{ copy.chartTitle }}</h2></div><p>{{ copy.chartIntro }}</p></div><div class="chart-legend"><span><i class="legend-dot baseline"></i>{{ copy.legendBaseline }}</span><span><i class="legend-dot recommended"></i>{{ copy.legendRecommended }}</span><span><i class="legend-dot guard"></i>{{ copy.legendGuard }}</span></div>@for (group of copy.scenarioGroups; track group.title; let groupIndex = $index) {<section class="scenario-group" [class.scenario-group-caution]="groupIndex === 2"><div class="scenario-group-heading"><span class="scenario-group-number">0{{ groupIndex + 1 }}</span><div><h3>{{ group.title }}</h3><p>{{ group.intro }}</p></div></div><div class="scenario-grid">@for (scenario of group.scenarios; track scenario.title) {<section class="scenario-card"><div class="scenario-card-header"><div><h3>{{ scenario.title }}</h3><p>{{ scenario.description }}</p></div><span class="scenario-unit">{{ scenario.unit }}</span></div><div class="scenario-bars"><div class="bar-row"><span>{{ copy.legendBaseline }}</span><div class="bar-track"><div class="bar-fill baseline" [style.width.%]="barWidth(scenario.baseline, scenario)" ></div></div><strong>{{ format(scenario.baseline) }}</strong></div><div class="bar-row"><span>{{ scenario.protectedLabel ?? copy.legendRecommended }}</span><div class="bar-track"><div class="bar-fill recommended" [style.width.%]="barWidth(scenario.recommended, scenario)" ></div></div><strong>{{ format(scenario.recommended) }}</strong></div>@if (scenario.normalGuard) {<div class="bar-row"><span>{{ copy.legendGuard }}</span><div class="bar-track"><div class="bar-fill guard" [style.width.%]="barWidth(scenario.normalGuard, scenario)" ></div></div><strong>{{ format(scenario.normalGuard) }}</strong></div>}</div><p class="scenario-takeaway">{{ scenario.takeaway }}</p></section>}</div></section>}</section>
      <section class="benchmark-section"><div class="benchmark-heading"><div><p class="eyebrow">02 / {{ copy.runtimeTitle }}</p><h2>{{ copy.runtimeTitle }}</h2></div><p>{{ copy.runtimeIntro }}</p></div><div class="runtime-grid">@for (item of copy.runtime; track item.label) {<div class="runtime-card"><span>{{ item.label }}</span><strong>{{ item.value }}</strong><small>{{ item.detail }}</small></div>}</div></section>
      <section class="benchmark-section"><div class="benchmark-heading"><div><p class="eyebrow">03 / {{ copy.guidanceTitle }}</p><h2>{{ copy.guidanceTitle }}</h2></div></div><div class="guidance-grid">@for (item of copy.guidance; track item.title) {<article><span class="guidance-mark">✓</span><div><h3>{{ item.title }}</h3><p>{{ item.body }}</p></div></article>}</div></section>
      <details class="method-panel"><summary>{{ copy.methodTitle }}</summary><div><p>{{ copy.methodBody }}</p><ul>@for (item of copy.methodItems; track item) {<li>{{ item }}</li>}</ul></div></details>
    </article>
  `,
})
export class PerformancePageComponent {
  private readonly translate = inject(TranslateService);
  public get content(): Copy { return this.translate.getCurrentLang() === 'pt' ? PT : EN; }
  public barWidth(value: number, scenario: Scenario): number { const max = Math.max(scenario.baseline, scenario.recommended, scenario.normalGuard ?? 0); return Math.max(5, (value / max) * 100); }
  public format(value: number): string { return `${value.toLocaleString(this.translate.getCurrentLang() === 'pt' ? 'pt-BR' : 'en-US', { maximumFractionDigits: 3 })} ms`; }
}
