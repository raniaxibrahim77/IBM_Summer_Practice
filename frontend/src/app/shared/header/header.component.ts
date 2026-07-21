import { Component, Input } from '@angular/core';
import { SidebarService } from '../sidebar.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  @Input() userName = 'Rania I.';
  @Input() userInitial = 'R';

  constructor(public sidebarService: SidebarService) {}
}