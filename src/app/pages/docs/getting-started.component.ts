import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

type ProjectKind = 'typescript' | 'express' | 'nestjs';

interface ProjectGuide {
  readonly label: string;
  readonly description: string;
  readonly install: string;
  readonly setup: string;
  readonly run: string;
  readonly note: string;
}

const GUIDES: Readonly<Record<'en' | 'pt', Readonly<Record<ProjectKind, ProjectGuide>>>> = {
  pt: {
    typescript: { label: 'TypeScript puro', description: 'Para bibliotecas, workers, CLIs ou qualquer projeto que já compile com tsc.', install: 'npm install --save-dev @ts-typed/compiler', setup: 'npx ts-typed init', run: 'npx ts-typed build', note: 'Execute a aplicação a partir de outDir, pois é ali que o JavaScript instrumentado é emitido.' },
    express: { label: 'Express', description: 'Para uma API Express onde contratos de request e resposta precisam ser checados nas fronteiras tipadas.', install: 'npm install --save-dev @ts-typed/compiler\nnpm install express', setup: 'npx ts-typed init', run: 'npx ts-typed build\nnode dist/server.js', note: 'Tipar parâmetros e retornos do seu controller/service cria as fronteiras validadas; use o JavaScript emitido no outDir para iniciar o servidor.' },
    nestjs: { label: 'NestJS', description: 'Para uma API Nest com mapeamento HTTP seguro para StrictTypeError.', install: 'npm install --save-dev @ts-typed/compiler @ts-typed/nestjs', setup: 'npx ts-typed init', run: 'npx ts-typed build\nnode dist/main.js', note: 'No init, selecione a integração NestJS quando solicitado. Ela registra o filtro global quando encontra um bootstrap convencional; confirme o resultado no seu main.ts.' },
  },
  en: {
    typescript: { label: 'Plain TypeScript', description: 'For libraries, workers, CLIs, or any project that already compiles with tsc.', install: 'npm install --save-dev @ts-typed/compiler', setup: 'npx ts-typed init', run: 'npx ts-typed build', note: 'Run the application from outDir, because that is where the instrumented JavaScript is emitted.' },
    express: { label: 'Express', description: 'For an Express API whose request and response contracts must be checked at typed boundaries.', install: 'npm install --save-dev @ts-typed/compiler\nnpm install express', setup: 'npx ts-typed init', run: 'npx ts-typed build\nnode dist/server.js', note: 'Typing your controller/service parameters and returns creates validated boundaries; start the server from the JavaScript emitted to outDir.' },
    nestjs: { label: 'NestJS', description: 'For a Nest API with safe HTTP mapping for StrictTypeError.', install: 'npm install --save-dev @ts-typed/compiler @ts-typed/nestjs', setup: 'npx ts-typed init', run: 'npx ts-typed build\nnode dist/main.js', note: 'Choose the NestJS integration when init asks. It registers the global filter when it finds a conventional bootstrap; verify the result in main.ts.' },
  },
};

@Component({
  selector: 'app-getting-started',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let guide = selectedGuide;
    <article class="mx-auto max-w-4xl text-slate-200">
      <h1 class="text-4xl font-bold text-white">{{ isPortuguese ? 'Primeiros passos' : 'Getting started' }}</h1>
      <p class="mt-5 text-lg leading-8 text-slate-300">{{ isPortuguese ? 'Escolha o tipo de projeto para ver somente os comandos e o bootstrap que se aplicam ao seu caso.' : 'Choose your project type to see only the commands and bootstrap that apply to your case.' }}</p>
      <div class="mt-8 grid gap-3 sm:grid-cols-3" role="tablist" [attr.aria-label]="isPortuguese ? 'Tipo de projeto' : 'Project type'">
        @for (kind of projectKinds; track kind) {<button type="button" role="tab" [attr.aria-selected]="selected() === kind" (click)="selected.set(kind)" class="rounded-xl border p-4 text-left transition" [class.border-cyan]="selected() === kind" [class.bg-cyan/10]="selected() === kind" [class.border-white/10]="selected() !== kind" [class.bg-white/5]="selected() !== kind"><span class="font-semibold" [class.text-cyan]="selected() === kind">{{ guides[kind].label }}</span><span class="mt-1 block text-xs leading-5 text-slate-400">{{ guides[kind].description }}</span></button>}
      </div>
      <section class="mt-8 min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-6"><h2 class="text-2xl font-bold text-white">{{ guide.label }}</h2><p class="mt-2 text-slate-400">{{ guide.description }}</p><div class="mt-6 grid min-w-0 gap-5"><div class="min-w-0"><h3 class="font-semibold text-cyan">1. {{ isPortuguese ? 'Instale' : 'Install' }}</h3><pre class="mt-2 max-w-full min-w-0 overflow-x-auto whitespace-pre rounded-lg bg-slate-950 p-4 text-sm text-slate-200"><code>{{ guide.install }}</code></pre></div><div class="min-w-0"><h3 class="font-semibold text-cyan">2. {{ isPortuguese ? 'Inicialize a configuração' : 'Initialize configuration' }}</h3><pre class="mt-2 max-w-full min-w-0 overflow-x-auto whitespace-pre rounded-lg bg-slate-950 p-4 text-sm text-slate-200"><code>{{ guide.setup }}</code></pre></div><div class="min-w-0"><h3 class="font-semibold text-cyan">3. {{ isPortuguese ? 'Compile e execute' : 'Build and run' }}</h3><pre class="mt-2 max-w-full min-w-0 overflow-x-auto whitespace-pre rounded-lg bg-slate-950 p-4 text-sm text-slate-200"><code>{{ guide.run }}</code></pre></div></div><p class="mt-6 border-l-2 border-cyan pl-3 leading-7 text-slate-300">{{ guide.note }}</p></section>
    </article>
  `,
})
export class GettingStartedComponent {
  private readonly translate = inject(TranslateService);
  public readonly selected = signal<ProjectKind>('typescript');
  public readonly projectKinds: readonly ProjectKind[] = ['typescript', 'express', 'nestjs'];
  public get isPortuguese(): boolean { return this.translate.getCurrentLang() === 'pt'; }
  public get guides(): Readonly<Record<ProjectKind, ProjectGuide>> { return GUIDES[this.isPortuguese ? 'pt' : 'en']; }
  public get selectedGuide(): ProjectGuide { return this.guides[this.selected()]; }
}
