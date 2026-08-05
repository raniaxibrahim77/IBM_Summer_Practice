import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineItem } from '../calendar-view.util';

@Component({
  selector: 'app-meeting-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-timeline.component.html',
  styleUrls: ['./meeting-timeline.component.css', '../calendar-shared.css'],
})
export class MeetingTimelineComponent {
  @Input() items: TimelineItem[] = [];
  @Output() meetingClick = new EventEmitter<string>();
}