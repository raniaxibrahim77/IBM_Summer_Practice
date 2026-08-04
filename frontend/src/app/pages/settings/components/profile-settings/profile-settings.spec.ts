import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';

import { ProfileSettings } from './profile-settings';

describe('ProfileSettings', () => {
  let component: ProfileSettings;
  let fixture: ComponentFixture<ProfileSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSettings],
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

    fixture = TestBed.createComponent(ProfileSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
