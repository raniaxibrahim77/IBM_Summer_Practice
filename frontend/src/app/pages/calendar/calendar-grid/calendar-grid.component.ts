import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarCell } from '../calendar-view.util';

@Component({
  selector: 'app-calendar-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-grid.component.html',
  styleUrls: ['./calendar-grid.component.css', '../calendar-shared.css'],
})
export class CalendarGridComponent {
  @Input() viewMonthLabel = '';
  @Input() weekdayLabels: string[] = [];
  @Input() cells: CalendarCell[] = [];

  @Output() previousMonth = new EventEmitter<void>();
  @Output() nextMonth = new EventEmitter<void>();
  @Output() today = new EventEmitter<void>();
  @Output() meetingClick = new EventEmitter<string>();

  selectedDay: CalendarCell | null = null;

  openDayDetails(cell: CalendarCell): void {
    this.selectedDay = cell;
  }

  closeDayDetails(): void {
    this.selectedDay = null;
  }
}