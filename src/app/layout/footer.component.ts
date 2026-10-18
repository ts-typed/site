import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  template: `
    <footer class="border-t border-white/10 py-10 text-sm text-slate-400">
      <div class="mx-auto max-w-6xl px-4 flex flex-col gap-4 sm:flex-row sm:justify-between">
        <p>© {{ year }} TS Typed. Apache-2.0.</p>
        <div class="flex gap-4">
          <a href="https://www.npmjs.com/package/@ts-typed/compiler" target="_blank" rel="noopener" class="hover:text-cyan">@ts-typed/compiler</a>
          <a href="https://www.npmjs.com/package/@ts-typed/nestjs" target="_blank" rel="noopener" class="hover:text-cyan">@ts-typed/nestjs</a>
          <a href="https://www.npmjs.com/package/@ts-typed/validators" target="_blank" rel="noopener" class="hover:text-cyan">@ts-typed/validators</a>
          <a href="https://github.com/ts-typed" target="_blank" rel="noopener" class="hover:text-cyan">GitHub</a>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  public readonly year = new Date().getFullYear();
}
