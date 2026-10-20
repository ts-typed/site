import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { PerformancePageComponent } from './performance-page.component';

describe('PerformancePageComponent', () => {
  let fixture: ComponentFixture<PerformancePageComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [PerformancePageComponent],
      providers: [provideTranslateService({ fallbackLang: 'en', lang: 'en' })],
    }).compileComponents();

    fixture = TestBed.createComponent(PerformancePageComponent);
    fixture.detectChanges();
  });

  it('renders comparable protected and unprotected scenarios', (): void => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Security');
    expect(text).toContain('TS Typed');
    expect(text).toContain('Without TS Typed');
    expect(text).toContain('10,000');
  });

  it('reveals the measurement details for an individual scenario', (): void => {
    const infoButton = fixture.nativeElement.querySelector('.info-button') as HTMLButtonElement;

    expect(infoButton).toBeTruthy();
    infoButton.click();
    fixture.detectChanges();

    const details = fixture.nativeElement.querySelector('.scenario-details') as HTMLElement;
    expect(details).toBeTruthy();
    expect(details.textContent).toContain('How it was measured');
  });
});
