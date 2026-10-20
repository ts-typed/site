import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideTranslateService({ fallbackLang: 'en', lang: 'en' })],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('displays the TS Typed logo in the site header', (): void => {
    const logo = fixture.nativeElement.querySelector('header img') as HTMLImageElement | null;

    expect(logo?.getAttribute('src')).toBe('/img/ts-typed.png');
    expect(logo?.getAttribute('alt')).toBe('TS Typed');
  });
});
