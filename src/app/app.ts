import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header.component';
import { FooterComponent } from './layout/footer.component';

@Component({
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  selector: 'app-root',
  template: `
    <div class="flex min-h-screen flex-col">
      <app-header />
      <main class="flex-1"><router-outlet /></main>
      <app-footer />
    </div>
  `,
})
export class App {}
