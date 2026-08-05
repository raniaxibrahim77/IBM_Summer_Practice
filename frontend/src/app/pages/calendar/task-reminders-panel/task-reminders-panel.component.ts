import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskReminder } from '../calendar-view.util';

@Component({
  selector: 'app-task-reminders-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-reminders-panel.component.html',
  styleUrls: ['../calendar-shared.css', './task-reminders-panel.component.css'],
})
export class TaskRemindersPanelComponent {
  @Input() tasks: TaskReminder[] = [];
  @Output() toggleTask = new EventEmitter<TaskReminder>();

  showAllTasksModal = false;
  taskPage = 0;
  readonly tasksPerPage = 5;

  get visibleTasks(): TaskReminder[] {
    return this.tasks.slice(0, 5);
  }

  get pagedModalTasks(): TaskReminder[] {
    const start = this.taskPage * this.tasksPerPage;
    return this.tasks.slice(start, start + this.tasksPerPage);
  }

  get totalTaskPages(): number {
    return Math.max(1, Math.ceil(this.tasks.length / this.tasksPerPage));
  }

  openTaskModal(): void {
    this.taskPage = 0;
    this.showAllTasksModal = true;
  }

  closeTaskModal(): void {
    this.showAllTasksModal = false;
  }

  nextTaskPage(): void {
    if (this.taskPage < this.totalTaskPages - 1) this.taskPage++;
  }

  prevTaskPage(): void {
    if (this.taskPage > 0) this.taskPage--;
  }
}