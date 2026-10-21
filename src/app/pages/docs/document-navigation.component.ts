import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  DocumentationFramework,
  DocumentationNavigationItem,
  DocumentationPage,
  getDeepeningLinks,
  getDocumentNeighbors,
} from '../../docs-catalog';

@Component({
  selector: 'app-document-navigation',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (deepeningLinks().length > 0) {
      <aside class="document-deepening" data-deepening aria-labelledby="document-deepening-title">
        <h2 id="document-deepening-title">{{ 'docs.navigation.deepen' | translate }}</h2>
        <div class="document-deepening-links">
          @for (link of deepeningLinks(); track link.slug) {
            <a [routerLink]="linkCommands(link)">{{ link.titleKey | translate }}</a>
          }
        </div>
      </aside>
    }
    <nav class="document-navigation" data-document-navigation aria-label="{{ 'docs.navigation.label' | translate }}">
      @if (neighbors().previous; as previous) {
        <a class="document-navigation-link document-navigation-previous" data-previous [routerLink]="linkCommands(previous)">
          <span>{{ 'docs.navigation.previous' | translate }}</span>
          <strong>{{ previous.titleKey | translate }}</strong>
        </a>
      }
      @if (neighbors().next; as next) {
        <a class="document-navigation-link document-navigation-next" data-next [routerLink]="linkCommands(next)">
          <span>{{ 'docs.navigation.next' | translate }}</span>
          <strong>{{ next.titleKey | translate }}</strong>
        </a>
      }
    </nav>
  `,
})
export class DocumentNavigationComponent {
  public readonly page = input.required<DocumentationPage>();
  public readonly lang = input.required<string>();
  public readonly version = input.required<string>();
  public readonly neighbors = computed(() => {
    const currentPage = this.page();
    return getDocumentNeighbors(currentPage.slug, currentPage.framework as DocumentationFramework | undefined);
  });
  public readonly deepeningLinks = computed(() => {
    const currentPage = this.page();
    return getDeepeningLinks(currentPage.slug, currentPage.framework as DocumentationFramework | undefined);
  });

  public linkCommands(item: DocumentationNavigationItem | DocumentationPage): readonly string[] {
    return ['/', this.lang(), 'docs', this.version(), ...(item.framework ? [item.framework] : []), item.slug];
  }
}
