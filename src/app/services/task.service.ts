// src/app/services/task.service.ts
import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  collectionData, 
  docData 
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private firestore: Firestore = inject(Firestore);
  private taskCollection = collection(this.firestore, 'tasks');

  // Get all tasks
  getTasks(): Observable<Task[]> {
    return collectionData(this.taskCollection, { idField: 'id' }) as Observable<Task[]>;
  }

  // Get a specific task by ID
  getTask(id: string): Observable<Task> {
    const taskDocRef = doc(this.firestore, `tasks/${id}`);
    return docData(taskDocRef, { idField: 'id' }) as Observable<Task>;
  }

  // Add a new task
  addTask(task: Omit<Task, 'id'>): Observable<string> {
    return from(addDoc(this.taskCollection, task)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Update an existing task
  updateTask(id: string, task: Partial<Task>): Observable<void> {
    const taskDocRef = doc(this.firestore, `tasks/${id}`);
    return from(updateDoc(taskDocRef, { ...task, updatedAt: new Date() }));
  }

  // Delete a task
  deleteTask(id: string): Observable<void> {
    const taskDocRef = doc(this.firestore, `tasks/${id}`);
    return from(deleteDoc(taskDocRef));
  }

  // Find nearby tasks (using Promise)
  findNearbyTasks(latitude: number, longitude: number, maxDistance: number = 500): Promise<Task[]> {
    return new Promise((resolve) => {
      this.getTasks().pipe(
        map(tasks => tasks.filter(task => {
          const distance = this.calculateDistance(
            latitude, 
            longitude, 
            task.location.latitude, 
            task.location.longitude
          );
          return distance <= maxDistance;
        }))
      ).subscribe(filteredTasks => {
        resolve(filteredTasks);
      });
    });
  }

  // Calculate distance between two coordinates using the Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
}