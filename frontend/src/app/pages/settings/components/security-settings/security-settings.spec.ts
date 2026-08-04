import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecuritySettings } from './security-settings';
import { of } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';

describe('SecuritySettings', () => {
  let component: SecuritySettings;
  let fixture: ComponentFixture<SecuritySettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecuritySettings],
      providers: [
        {
          provide: AuthService,
          useValue: {
            updateProfile: () =>
              of({
                id: 'user-1',
                username: 'Test User',
                email: 'test@example.com',
              }),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecuritySettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
