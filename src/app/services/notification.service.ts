// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor() {
    this.initNotifications();
  }

  // Initialize notification permissions
  async initNotifications(): Promise<void> {
    try {
      const permissionStatus = await LocalNotifications.requestPermissions();
      if (!permissionStatus.display) {
        console.warn('Notification permission not granted');
      }
    } catch (error) {
      console.error('Error requesting notification permissions', error);
    }
  }

  // Send notification for a nearby task
  async sendTaskNotification(task: Task): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: 'Task Nearby: ' + task.title,
            body: task.description || 'You are near a location with a pending task',
            schedule: { at: new Date(Date.now()) },
            sound: 'beep.wav',
            actionTypeId: '',
            extra: { taskId: task.id }
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling notification', error);
    }
  }

  // Send general notification
  async sendNotification(title: string, body: string): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body,
            schedule: { at: new Date(Date.now()) }
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling notification', error);
    }
  }

  // Check for and trigger notifications for nearby tasks
  async checkNearbyTasks(tasks: Task[], currentLocation: { latitude: number, longitude: number }): Promise<void> {
    for (const task of tasks) {
      if (task.completed) continue;
      
      // Calculate distance to task
      const distance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        task.location.latitude,
        task.location.longitude
      );
      
      // If within radius, send notification
      if (distance <= task.radius) {
        await this.sendTaskNotification(task);
      }
    }
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