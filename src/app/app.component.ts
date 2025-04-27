// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
import { GeolocationService } from './services/geolocation.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, IonicModule],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private geolocationService: GeolocationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    this.notificationService.initNotifications();
    
    // Check if geolocation is available
    if (this.geolocationService.isAvailable()) {
      try {
        // Request permissions when app starts
        await this.geolocationService.getCurrentPosition();
      } catch (error) {
        console.error('Error initializing geolocation', error);
      }
    }
  }
}