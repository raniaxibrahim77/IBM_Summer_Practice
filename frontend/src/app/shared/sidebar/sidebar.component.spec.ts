import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])],
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
});