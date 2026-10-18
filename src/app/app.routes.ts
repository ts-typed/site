import { Routes } from '@angular/router';
import { RootRedirectComponent } from './pages/root-redirect.component';
import { LandingComponent } from './pages/landing/landing.component';
import { DocsLayoutComponent } from './pages/docs/docs-layout.component';
import { DocPageComponent } from './pages/docs/doc-page.component';
import { langResolver } from './services/lang-resolver';

export const routes: Routes = [
  { path: '', component: RootRedirectComponent },
  {
    path: ':lang',
    resolve: { lang: langResolver },
    children: [
      { path: '', component: LandingComponent },
      {
        path: 'docs',
        component: DocsLayoutComponent,
        children: [
          { path: '', redirectTo: 'introduction', pathMatch: 'full' },
          { path: ':slug', component: DocPageComponent },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
