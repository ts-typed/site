import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { GettingStartedComponent } from './getting-started.component';

describe('GettingStartedComponent', () => {
  let fixture: ComponentFixture<GettingStartedComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [GettingStartedComponent],
      providers: [provideTranslateService({ fallbackLang: 'en', lang: 'en' })],
    }).compileComponents();
    fixture = TestBed.createComponent(GettingStartedComponent);
    fixture.detectChanges();
  });

  it('keeps terminal commands inside a horizontally scrollable container', (): void => {
    const terminal = fixture.nativeElement.querySelector('pre') as HTMLPreElement;

    expect(terminal.classList.contains('max-w-full')).toBe(true);
    expect(terminal.classList.contains('min-w-0')).toBe(true);
    expect(terminal.classList.contains('overflow-x-auto')).toBe(true);
  });
});
