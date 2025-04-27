// src/app/pages/task-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../services/task.service';
import { GeolocationService } from '../services/geolocation.service';
import { Task } from '../models/task.model';
import { LocationPickerComponent } from '../components/location-picker.component';
import { LocationData } from '../services/geolocation.service';
import { catchError, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    LocationPickerComponent
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditMode ? 'Edit Task' : 'New Task' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
        <ion-item>
          <ion-label position="floating">Title</ion-label>
          <ion-input formControlName="title" type="text"></ion-input>
          <ion-note slot="error" *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched">
            Title is required
          </ion-note>
        </ion-item>
        
        <ion-item>
          <ion-label position="floating">Description</ion-label>
          <ion-textarea formControlName="description" rows="3"></ion-textarea>
        </ion-item>
        
        <app-location-picker
          [initialLocation]="initialLocation"
          [initialRadius]="initialRadius"
          (locationChange)="onLocationChange($event)"
        ></app-location-picker>
        
        <div class="ion-padding">
          <ion-button expand="block" type="submit" [disabled]="taskForm.invalid || !hasLocation">
            {{ isEditMode ? 'Update' : 'Create' }} Task
          </ion-button>
        </div>
      </form>
    </ion-content>
  `
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId?: string;
  hasLocation = false;
  
  // For location picker
  initialLocation?: { latitude: number; longitude: number; address?: string };
  initialRadius: number = 200;
  
  selectedLocation?: LocationData & { address?: string };
  selectedRadius: number = 200;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private geolocationService: GeolocationService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit() {
    const taskId = this.route.snapshot.paramMap.get('id');
    
    if (taskId) {
      this.isEditMode = true;
      this.taskId = taskId;
      this.loadTask(taskId);
    } else {
      // For new tasks, pre-load the current location
      this.getCurrentLocation();
    }
  }

  loadTask(taskId: string) {
    this.taskService.getTask(taskId).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description || ''
        });
        
        this.initialLocation = task.location;
        this.initialRadius = task.radius;
        this.selectedLocation = task.location;
        this.selectedRadius = task.radius;
        this.hasLocation = true;
      },
      error: (err) => {
        console.error('Error loading task', err);
      }
    });
  }

  async getCurrentLocation() {
    try {
      const location = await this.geolocationService.getCurrentPosition();
      this.initialLocation = location;
      this.selectedLocation = location;
      this.hasLocation = true;
    } catch (error) {
      console.error('Error getting current location', error);
    }
  }

  onLocationChange(event: { location: LocationData & { address?: string }, radius: number }) {
    this.selectedLocation = event.location;
    this.selectedRadius = event.radius;
    this.hasLocation = true;
  }

  onSubmit() {
    if (this.taskForm.invalid || !this.selectedLocation) {
      return;
    }

    const taskData: Omit<Task, 'id'> = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      location: {
        latitude: this.selectedLocation.latitude,
        longitude: this.selectedLocation.longitude,
        address: this.selectedLocation.address
      },
      radius: this.selectedRadius,
      completed: false,
      createdAt: new Date()
    };

    if (this.isEditMode && this.taskId) {
      // Update existing task
      this.taskService.updateTask(this.taskId, taskData).pipe(
        catchError(error => {
          console.error('Error updating task', error);
          return of(null);
        })
      ).subscribe(() => {
        this.router.navigate(['/']);
      });
    } else {
      // Create new task
      this.taskService.addTask(taskData).pipe(
        catchError(error => {
          console.error('Error creating task', error);
          return of(null);
        })
      ).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }
}