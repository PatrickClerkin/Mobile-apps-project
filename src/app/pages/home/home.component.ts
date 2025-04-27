// src/app/pages/home.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TaskItemComponent } from '../components/task-item.component';
import { TaskService } from '../services/task.service';
import { GeolocationService } from '../services/geolocation.service';
import { NotificationService } from '../services/notification.service';
import { Task } from '../models/task.model';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, TaskItemComponent],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>GeoTask</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      
      <ion-list>
        <ion-item-group *ngIf="pendingTasks.length > 0">
          <ion-item-divider>
            <ion-label>Pending Tasks</ion-label>
          </ion-item-divider>
          <app-task-item
            *ngFor="let task of pendingTasks"
            [task]="task"
            (onEdit)="editTask($event)"
            (onDelete)="deleteTask($event)"
            (onComplete)="toggleTaskComplete($event)">
          </app-task-item>
        </ion-item-group>
        
        <ion-item-group *ngIf="completedTasks.length > 0">
          <ion-item-divider>
            <ion-label>Completed Tasks</ion-label>
          </ion-item-divider>
          <app-task-item
            *ngFor="let task of completedTasks"
            [task]="task"
            (onEdit)="editTask($event)"
            (onDelete)="deleteTask($event)"
            (onComplete)="toggleTaskComplete($event)">
          </app-task-item>
        </ion-item-group>
        
        <ion-item *ngIf="pendingTasks.length === 0 && completedTasks.length === 0">
          <ion-label class="ion-text-center">
            No tasks yet. Create your first task!
          </ion-label>
        </ion-item>
      </ion-list>
      
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button routerLink="/task-form">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  pendingTasks: Task[] = [];
  completedTasks: Task[] = [];
  
  private taskSubscription?: Subscription;
  private locationSubscription?: Subscription;
  private nearbyCheckSubscription?: Subscription;
  
  constructor(
    private taskService: TaskService,
    private geolocationService: GeolocationService,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit() {
    this.loadTasks();
    this.startLocationTracking();
    this.startNearbyTasksCheck();
  }
  
  ngOnDestroy() {
    this.taskSubscription?.unsubscribe();
    this.locationSubscription?.unsubscribe();
    this.nearbyCheckSubscription?.unsubscribe();
    this.geolocationService.stopWatchingPosition();
  }
  
  loadTasks() {
    this.taskSubscription = this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.pendingTasks = tasks.filter(task => !task.completed);
      this.completedTasks = tasks.filter(task => task.completed);
    });
  }
  
  startLocationTracking() {
    this.geolocationService.startWatchingPosition();
  }
  
  startNearbyTasksCheck() {
    // Check for nearby tasks every 60 seconds
    this.nearbyCheckSubscription = interval(60000).pipe(
      switchMap(() => this.geolocationService.getCurrentPositionAsObservable())
    ).subscribe(location => {
      this.checkForNearbyTasks(location);
    });
  }
  
  async checkForNearbyTasks(location: { latitude: number, longitude: number }) {
    try {
      // Using Promise-based approach for finding nearby tasks
      const nearbyTasks = await this.taskService.findNearbyTasks(
        location.latitude, 
        location.longitude
      );
      
      // Check and send notifications for nearby tasks
      await this.notificationService.checkNearbyTasks(nearbyTasks, location);
    } catch (error) {
      console.error('Error checking for nearby tasks', error);
    }
  }
  
  handleRefresh(event: any) {
    this.loadTasks();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
  
  editTask(task: Task) {
    // Navigate to edit page with task ID
    window.location.href = `/task-form/${task.id}`;
  }
  
  deleteTask(taskId?: string) {
    if (!taskId) return;
    
    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        // Task deleted successfully - our subscription will update the list
      },
      error: (err) => {
        console.error('Error deleting task', err);
      }
    });
  }
  
  toggleTaskComplete(data: {id: string; completed: boolean}) {
    this.taskService.updateTask(data.id, { completed: data.completed }).subscribe({
      next: () => {
        // Task updated successfully - our subscription will update the list
      },
      error: (err) => {
        console.error('Error updating task', err);
      }
    });
  }
}