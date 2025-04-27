// src/app/components/location-picker.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GeolocationService, LocationData } from '../services/geolocation.service';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Location</ion-card-title>
      </ion-card-header>
      
      <ion-card-content>
        <div class="map-placeholder">
          <p *ngIf="!selectedLocation">No location selected</p>
          <div *ngIf="selectedLocation" class="location-info">
            <p>Latitude: {{ selectedLocation.latitude.toFixed(6) }}</p>
            <p>Longitude: {{ selectedLocation.longitude.toFixed(6) }}</p>
          </div>
        </div>
        
        <ion-item>
          <ion-label position="stacked">Address (optional)</ion-label>
          <ion-input [(ngModel)]="address" placeholder="Enter a description of this location"></ion-input>
        </ion-item>
        
        <ion-item>
          <ion-label position="stacked">Radius (meters)</ion-label>
          <ion-range [(ngModel)]="radius" min="50" max="1000" step="50" snaps="true">
            <ion-label slot="start">50m</ion-label>
            <ion-label slot="end">1000m</ion-label>
          </ion-range>
        </ion-item>
        
        <ion-button expand="block" (click)="useCurrentLocation()">
          <ion-icon name="locate-outline" slot="start"></ion-icon>
          Use My Current Location
        </ion-button>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .map-placeholder {
      width: 100%;
      height: 150px;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 15px;
      border-radius: 8px;
    }
    
    .location-info {
      text-align: center;
      width: 100%;
    }
  `]
})
export class LocationPickerComponent implements OnInit {
  @Input() initialLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  
  @Input() initialRadius: number = 200;
  
  @Output() locationChange = new EventEmitter<{
    location: LocationData & { address?: string },
    radius: number
  }>();
  
  selectedLocation: LocationData | null = null;
  address: string = '';
  radius: number = 200;
  
  constructor(private geolocationService: GeolocationService) {}
  
  ngOnInit() {
    if (this.initialLocation) {
      this.selectedLocation = {
        latitude: this.initialLocation.latitude,
        longitude: this.initialLocation.longitude
      };
      this.address = this.initialLocation.address || '';
    }
    
    if (this.initialRadius) {
      this.radius = this.initialRadius;
    }
  }
  
  async useCurrentLocation() {
    try {
      const location = await this.geolocationService.getCurrentPosition();
      this.selectedLocation = location;
      this.emitLocationChange();
    } catch (error) {
      console.error('Error getting current location', error);
    }
  }
  
  emitLocationChange() {
    if (this.selectedLocation) {
      this.locationChange.emit({
        location: {
          ...this.selectedLocation,
          address: this.address
        },
        radius: this.radius
      });
    }
  }
}