import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SettingsComponent } from './settings.component';
import { AuthService } from '../../services/auth.service';

describe('SettingsComponent', () => {
  const currentUser = {
    id: 'user-1',
    username: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => currentUser,
            updateProfile: () => of(currentUser),
            logout: () => {},
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the settings page', () => {
    const fixture = TestBed.createComponent(SettingsComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render profile and security sections', () => {
    const fixture = TestBed.createComponent(SettingsComponent);

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const headings = Array.from(
      element.querySelectorAll<HTMLHeadingElement>('h2')
    ).map((heading) => heading.textContent?.trim());

    expect(headings).toContain('Profile information');
    expect(headings).toContain('Security');
  });

  it('should display the current user', () => {
    const fixture = TestBed.createComponent(SettingsComponent);

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Test User');
    expect(element.textContent).toContain('test@example.com');
  });
});