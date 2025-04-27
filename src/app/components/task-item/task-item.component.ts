// src/app/components/task-item.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-item>
      <ion-checkbox 
        slot="start" 
        [checked]="task.completed" 
        (ionChange)="onCompleteToggle($event)">
      </ion-checkbox>
      
      <ion-label>
        <h2 [class.completed]="task.completed">{{ task.title }}</h2>
        <p *ngIf="task.description">{{ task.description }}</p>
        <p *ngIf="task.location?.address">
          <ion-icon name="location-outline"></ion-icon> 
          {{ task.location.address }}
        </p>
      </ion-label>
      
      <ion-buttons slot="end">
        <ion-button (click)="onEdit.emit(task)">
          <ion-icon name="create-outline" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-button (click)="onDelete.emit(task.id)">
          <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-item>
  `,
  styles: [`
    .completed {
      text-decoration: line-through;
      color: var(--ion-color-medium);
    }
  `]
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() onEdit = new EventEmitter<Task>();
  @Output() onDelete = new EventEmitter<string>();
  @Output() onComplete = new EventEmitter<{id: string; completed: boolean}>();

  onCompleteToggle(event: CustomEvent) {
    const completed = event.detail.checked;
    this.onComplete.emit({
      id: this.task.id!,
      completed
    });
  }
}