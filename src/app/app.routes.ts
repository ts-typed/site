import { Routes } from '@angular/router';
import { RootRedirectComponent } from './pages/root-redirect.component';
import { LandingComponent } from './pages/landing/landing.component';
import { DocsLayoutComponent } from './pages/docs/docs-layout.component';
import { DocPageComponent } from './pages/docs/doc-page.component';
import { PerformancePageComponent } from './pages/docs/performance-page.component';
import { GettingStartedComponent } from './pages/docs/getting-started.component';
import { CURRENT_DOCUMENTATION_VERSION } from './docs-versions';
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
          { path: '', redirectTo: `${CURRENT_DOCUMENTATION_VERSION}/introduction`, pathMatch: 'full' },
          { path: ':version/getting-started', component: GettingStartedComponent },
          { path: ':version/performance', component: PerformancePageComponent },
          { path: ':version/:slug', component: DocPageComponent },
          { path: 'getting-started', component: GettingStartedComponent },
          { path: 'performance', component: PerformancePageComponent },
          { path: ':slug', component: DocPageComponent },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
