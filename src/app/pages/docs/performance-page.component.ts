import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface Scenario {
  readonly title: string;
  readonly description: string;
  readonly baseline: string;
  readonly protected: string;
  readonly impact: string;
  readonly takeaway: string;
  readonly baselineMilliseconds: number;
  readonly protectedMilliseconds: number;
}

interface PerformanceCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly scenarioTitle: string;
  readonly scenarioIntro: string;
  readonly withoutLabel: string;
  readonly withLabel: string;
  readonly scenarios: readonly Scenario[];
  readonly costTitle: string;
  readonly costIntro: string;
  readonly costs: readonly { readonly label: string; readonly value: string; readonly detail: string }[];
  readonly recommendationTitle: string;
  readonly recommendations: readonly { readonly title: string; readonly body: string }[];
  readonly methodTitle: string;
  readonly methodBody: string;
  readonly methodItems: readonly string[];
}

const SCENARIOS: readonly Scenario[] = [
  {
    title: 'Express: 50 DTOs de saída',
    description: 'TypeORM materializa entidades, um .map() remove passwordHash e a resposta é serializada.',
    baseline: '1,19 ms',
    protected: '1,40 ms',
    impact: '+17% de latência',
    takeaway: 'TTOptImmut mantém a validação e a imutabilidade. O caminho normal com accessors mediu 2,12 ms neste mesmo cenário.',
    baselineMilliseconds: 1.1927584,
    protectedMilliseconds: 1.395425,
  },
  {
    title: 'Express: 10.000 DTOs de saída',
    description: 'Cenário extremo: TypeORM materializa 10.000 UserEntity, .map() remove passwordHash e a resposta é serializada.',
    baseline: '55,76 ms',
    protected: '115,01 ms',
    impact: '+106% de latência',
    takeaway: 'TTOptImmut evita milhares de accessors. O caminho normal com guards mediu 256,44 ms; a validação continua completa nos dois casos.',
    baselineMilliseconds: 55.756425,
    protectedMilliseconds: 115.00995,
  },
  {
    title: 'Nest: 10.000 DTOs + filtro',
    description: 'O mesmo fluxo roda em um controller Nest, incluindo StrictTypeErrorFilter no caminho protegido.',
    baseline: '56,28 ms',
    protected: '117,38 ms',
    impact: '+109% de latência',
    takeaway: 'O perfil é próximo ao Express: o volume domina. Com guards mutáveis, a mesma rota mediu 258,50 ms.',
    baselineMilliseconds: 56.2817584,
    protectedMilliseconds: 117.3791416,
  },
];

const PT: PerformanceCopy = {
  eyebrow: 'Referência local',
  title: 'Performance por cenário',
  intro: 'O impacto aparece no caminho completo: hidratar entities, remover dados sensíveis, validar e devolver uma DTO imutável.',
  scenarioTitle: 'Resposta HTTP: estratégia recomendada',
  scenarioIntro: 'As barras mostram a latência mediana do mesmo fluxo. Menor é melhor.',
  withoutLabel: 'Sem TS Typed',
  withLabel: 'Com TS Typed + TTOptImmut',
  scenarios: SCENARIOS,
  costTitle: 'Custo isolado da validação',
  costIntro: 'Sem HTTP, banco, JSON ou serialização: apenas o trabalho do runtime do TS Typed.',
  costs: [
    { label: 'DTO simples UserResponse', value: '0,565 µs', detail: 'assertValue em um objeto de saída.' },
    { label: '50 DTOs: guards / TTOptImmut', value: '0,269 / 0,060 ms', detail: 'Projeção, validação e proteção do lote.' },
    { label: '10.000 DTOs: guards / TTOptImmut', value: '44,83 / 10,58 ms', detail: '4,2x mais rápido sem pular validação.' },
  ],
  recommendationTitle: 'Sugestões de uso',
  recommendations: [
    { title: 'Paginar antes de otimizar', body: '10.000 itens em uma resposta é o maior gargalo, com ou sem TS Typed. Prefira páginas limitadas, cursor ou streaming.' },
    { title: 'Use TTOptImmut para DTOs de saída', body: 'Para POJOs novos que não serão alterados, use TTOptImmut<IUserData[]>: ele valida e congela o lote, preservando Object.keys, spread e structuredClone.' },
    { title: 'Mantenha guards nas entities', body: 'Entity, classe, Date, Map, Set ou qualquer valor mutável continuam no caminho normal. TTOptImmut é explícito e não faz fallback silencioso.' },
    { title: 'Decorator não é atalho de performance', body: 'Use @ServerPopulated() para classificar uma violação de entidade como erro do servidor; ele melhora a semântica do erro, não reduz a validação.' },
  ],
  methodTitle: 'Ambiente e método do benchmark',
  methodBody: 'Medições locais de referência, não uma promessa de capacidade em produção nem um benchmark de banco remoto.',
  methodItems: [
    'Node 22.22.3; TypeORM 0.3.28 + better-sqlite3 12.11.1 em memória.',
    '10.000 instâncias reais de UserEntity; passwordHash é removido por .map(). Os cenários usam 1, 50 e 10.000 itens.',
    'HTTP: cinco amostras de 20 requisições, concorrência 4; as barras usam a latência mediana estimada.',
    'O caminho recomendado valida a entity, projeta a resposta e executa TTOptImmut (validate-then-freeze) em UserResponse[].',
    'CPU, versão do Node, driver, rede e formato da resposta alteram o resultado. Rode o benchmark no seu ambiente antes de definir capacidade.',
  ],
};

const EN: PerformanceCopy = {
  ...PT,
  eyebrow: 'Local reference',
  title: 'Performance by scenario',
  intro: 'Cost appears in the complete path: hydrate entities, remove sensitive data, validate, and return an immutable DTO.',
  scenarioTitle: 'HTTP response: recommended strategy',
  scenarioIntro: 'Bars show the median latency for the same flow. Lower is better.',
  withoutLabel: 'Without TS Typed',
  withLabel: 'With TS Typed + TTOptImmut',
  scenarios: SCENARIOS.map((scenario, index) => ({
    ...scenario,
    title: scenario.title.replace('de saída', 'output').replace('filtro', 'filter'),
    description: scenario.title.startsWith('Express') ? 'TypeORM materializes entities; a .map() removes passwordHash; the response is serialized.' : 'The same flow runs in a Nest controller, including StrictTypeErrorFilter on the protected path.',
    baseline: scenario.baseline.replace(',', '.'),
    protected: scenario.protected.replace(',', '.'),
    impact: scenario.impact.replace(' de latência', ' latency'),
    takeaway: [
      'TTOptImmut keeps validation and immutability. The normal accessor path measured 2.12 ms for this same scenario.',
      'TTOptImmut avoids thousands of accessors. The normal guarded path measured 256.44 ms; validation remains complete in both cases.',
      'The profile is close to Express: volume dominates. The same route with mutable guards measured 258.50 ms.',
    ][index],
  })),
  costTitle: 'Isolated validation cost',
  costIntro: 'No HTTP, database, JSON, or serialization: only TS Typed runtime work.',
  costs: [
    { label: 'Simple UserResponse DTO', value: '0.565 µs', detail: 'assertValue on one output object.' },
    { label: '50 DTOs: guards / TTOptImmut', value: '0.269 / 0.060 ms', detail: 'Batch projection, validation, and protection.' },
    { label: '10,000 DTOs: guards / TTOptImmut', value: '44.83 / 10.58 ms', detail: '4.2x faster without skipping validation.' },
  ],
  recommendationTitle: 'Usage guidance',
  recommendations: [
    { title: 'Paginate before optimizing', body: '10,000 items in one response is the largest bottleneck, with or without TS Typed. Prefer bounded pages, cursors, or streaming.' },
    { title: 'Use TTOptImmut for output DTOs', body: 'For fresh POJOs that will not change, use TTOptImmut<IUserData[]>: it validates and freezes the batch while preserving Object.keys, spread, and structuredClone.' },
    { title: 'Keep guards on entities', body: 'An entity, class, Date, Map, Set, or otherwise mutable value stays on the normal path. TTOptImmut is explicit and has no silent fallback.' },
    { title: 'A decorator is not a performance shortcut', body: 'Use @ServerPopulated() to classify an entity violation as a server error; it improves error semantics, not validation cost.' },
  ],
  methodTitle: 'Benchmark environment and method',
  methodBody: 'Local reference measurements, not a production-capacity promise or a remote-database benchmark.',
  methodItems: [
    'Node 22.22.3; TypeORM 0.3.28 + better-sqlite3 12.11.1 in memory.',
    '10,000 real UserEntity instances; passwordHash is removed with .map(). Scenarios use 1, 50, and 10,000 items.',
    'HTTP: five samples of 20 requests, concurrency 4; bars use estimated median latency.',
    'The recommended path validates the entity, projects the response, and runs TTOptImmut (validate-then-freeze) on UserResponse[].',
    'CPU, Node version, driver, network, and response shape affect results. Run the benchmark in your environment before setting capacity.',
  ],
};

@Component({
  selector: 'app-performance-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let copy = content;
    <article class="mx-auto max-w-4xl text-slate-200">
      <header class="border-b border-white/10 pb-8"><p class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan">{{ copy.eyebrow }}</p><h1 class="text-4xl font-bold text-white sm:text-5xl">{{ copy.title }}</h1><p class="mt-5 text-lg leading-8 text-slate-300">{{ copy.intro }}</p></header>
      <section class="mt-10"><h2 class="text-2xl font-bold text-white">{{ copy.scenarioTitle }}</h2><p class="mt-2 text-slate-400">{{ copy.scenarioIntro }}</p><div class="mt-6 grid gap-5">@for (scenario of copy.scenarios; track scenario.title) {<section class="rounded-2xl border border-white/10 bg-slate-900/70 p-5"><div class="flex flex-col gap-2 sm:flex-row sm:justify-between"><div><h3 class="text-lg font-semibold text-white">{{ scenario.title }}</h3><p class="mt-1 text-sm leading-6 text-slate-400">{{ scenario.description }}</p></div><span class="h-fit rounded-lg bg-rose-400/10 px-3 py-1 text-sm font-bold text-rose-300">{{ scenario.impact }}</span></div><div class="mt-6 space-y-5"><div><div class="mb-2 flex justify-between gap-4 text-sm"><span>{{ copy.withoutLabel }}</span><span class="font-mono font-semibold text-white">{{ scenario.baseline }}</span></div><div class="h-4 overflow-hidden rounded-full bg-slate-800" role="img" [attr.aria-label]="copy.withoutLabel + ': ' + scenario.baseline"><div class="h-full rounded-full bg-slate-500" [style.width.%]="barWidth(scenario, false)"></div></div></div><div><div class="mb-2 flex justify-between gap-4 text-sm"><span class="text-cyan">{{ copy.withLabel }}</span><span class="font-mono font-semibold text-cyan">{{ scenario.protected }}</span></div><div class="h-4 overflow-hidden rounded-full bg-slate-800" role="img" [attr.aria-label]="copy.withLabel + ': ' + scenario.protected"><div class="h-full rounded-full bg-cyan" [style.width.%]="barWidth(scenario, true)"></div></div></div></div><p class="mt-5 border-l-2 border-cyan pl-3 text-sm leading-6 text-slate-300">{{ scenario.takeaway }}</p></section>}</div></section>
      <section class="mt-12"><h2 class="text-2xl font-bold text-white">{{ copy.costTitle }}</h2><p class="mt-2 text-slate-400">{{ copy.costIntro }}</p><div class="mt-5 grid gap-4 sm:grid-cols-3">@for (cost of copy.costs; track cost.label) {<div class="rounded-xl border border-white/10 bg-white/[0.03] p-4"><p class="text-sm text-slate-400">{{ cost.label }}</p><p class="mt-2 font-mono text-2xl font-bold text-white">{{ cost.value }}</p><p class="mt-2 text-xs text-slate-500">{{ cost.detail }}</p></div>}</div></section>
      <section class="mt-12"><h2 class="text-2xl font-bold text-white">{{ copy.recommendationTitle }}</h2><div class="mt-5 grid gap-4">@for (recommendation of copy.recommendations; track recommendation.title) {<div class="rounded-xl border border-cyan/20 bg-cyan/5 p-5"><h3 class="font-semibold text-cyan">{{ recommendation.title }}</h3><p class="mt-2 leading-7 text-slate-300">{{ recommendation.body }}</p></div>}</div></section>
      <details class="group mt-12 rounded-2xl border border-white/10 bg-slate-900/70 p-5"><summary class="cursor-pointer font-semibold text-white">{{ copy.methodTitle }}</summary><div class="mt-5 border-t border-white/10 pt-5 text-sm leading-7 text-slate-300"><p>{{ copy.methodBody }}</p><ul class="mt-4 list-disc space-y-2 pl-5 text-slate-400">@for (item of copy.methodItems; track item) {<li>{{ item }}</li>}</ul></div></details>
    </article>
  `,
})
export class PerformancePageComponent {
  private readonly translate = inject(TranslateService);

  public get content(): PerformanceCopy { return this.translate.getCurrentLang() === 'pt' ? PT : EN; }
  public barWidth(scenario: Scenario, isProtected: boolean): number { const value = isProtected ? scenario.protectedMilliseconds : scenario.baselineMilliseconds; return Math.max(8, (value / Math.max(scenario.baselineMilliseconds, scenario.protectedMilliseconds)) * 100); }
}
