import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../services/auth.service';

describe('SidebarComponent', () => {
    let logoutCalled: boolean;

    beforeEach(async () => {
        logoutCalled = false;

        await TestBed.configureTestingModule({
            imports: [SidebarComponent],
            providers:
                [provideRouter([]),
                {
                provide: AuthService,
                useValue: {
                    logout: () => {
                        logoutCalled = true;
                        },
                    },
                },
            ],
        }).compileComponents();
    });

  it('should create the sidebar', () => {
    const fixture = TestBed.createComponent(SidebarComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the navigation links', () => {
    const fixture = TestBed.createComponent(SidebarComponent);

    fixture.detectChanges();

    const navigation = fixture.nativeElement.querySelector(
      'nav'
    ) as HTMLElement;

    expect(navigation.textContent).toContain('Home');
    expect(navigation.textContent).toContain('Calendar');
    expect(navigation.textContent).toContain('Meetings');
    expect(navigation.textContent).toContain('Settings');
  });

  it('should link to the settings page', () => {
    const fixture = TestBed.createComponent(SidebarComponent);

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const links = Array.from(
        element.querySelectorAll<HTMLAnchorElement>('a')
    );

    const settingsLink = links.find((link) =>
        link.textContent?.includes('Settings')
    );

    expect(settingsLink).toBeTruthy();
    expect(settingsLink?.getAttribute('href')).toBe('/settings');
    });

    it('should log out the current user', () => {
        const fixture = TestBed.createComponent(SidebarComponent);

        fixture.detectChanges();

        const element = fixture.nativeElement as HTMLElement;
        const logoutButton = Array.from(
        element.querySelectorAll<HTMLButtonElement>('button')
        ).find((button) => button.textContent?.includes('Logout'));

        expect(logoutButton).toBeTruthy();

        logoutButton!.click();

        expect(logoutCalled).toBe(true);
    });
});