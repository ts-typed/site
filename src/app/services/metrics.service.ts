import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of, catchError, map } from 'rxjs';

const REPOS = ['ts-typed/compiler', 'ts-typed/nestjs', 'ts-typed/validators'];
const PACKAGES = ['@ts-typed/core', '@ts-typed/nestjs', '@ts-typed/validators'];

export interface ProjectMetrics {
  readonly stars: number | null;
  readonly monthlyDownloads: number | null;
}

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  public fetch() {
    if (!isPlatformBrowser(this.platformId)) {
      return of<ProjectMetrics>({ stars: null, monthlyDownloads: null });
    }
    const stars$ = forkJoin(
      REPOS.map((repo) =>
        this.http.get<{ stargazers_count: number }>(`https://api.github.com/repos/${repo}`).pipe(
          map((r) => r.stargazers_count),
          catchError(() => of(0)),
        ),
      ),
    ).pipe(
      map((counts) => counts.reduce((a, b) => a + b, 0)),
      catchError(() => of<number | null>(null)),
    );

    const downloads$ = forkJoin(
      PACKAGES.map((pkg) =>
        this.http
          .get<{ downloads: number }>(`https://api.npmjs.org/downloads/point/last-month/${pkg}`)
          .pipe(
            map((r) => r.downloads),
            catchError(() => of(0)),
          ),
      ),
    ).pipe(
      map((counts) => counts.reduce((a, b) => a + b, 0)),
      catchError(() => of<number | null>(null)),
    );

    return forkJoin([stars$, downloads$]).pipe(
      map(([stars, monthlyDownloads]) => ({ stars, monthlyDownloads })),
    );
  }
}
