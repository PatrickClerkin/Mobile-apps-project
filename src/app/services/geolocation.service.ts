// src/app/services/geolocation.service.ts
import { Injectable } from '@angular/core';
import { Observable, from, Subject, BehaviorSubject } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  // Observable for continuous location updates
  private locationSubject = new BehaviorSubject<LocationData | null>(null);
  public locationUpdates$ = this.locationSubject.asObservable();
  
  // Watch ID for tracking
  private watchId: string | undefined;

  constructor() { }

  // Check if geolocation is available
  isAvailable(): boolean {
    return Capacitor.isPluginAvailable('Geolocation');
  }

  // Get current position (Promise-based)
  async getCurrentPosition(): Promise<LocationData> {
    if (!this.isAvailable()) {
      throw new Error('Geolocation is not available on this device');
    }
    
    try {
      const position = await Geolocation.getCurrentPosition();
      return this.extractLocationData(position);
    } catch (error) {
      console.error('Error getting current position', error);
      throw error;
    }
  }

  // Get current position (Observable-based)
  getCurrentPositionAsObservable(): Observable<LocationData> {
    return from(this.getCurrentPosition());
  }

  // Start watching position changes
  startWatchingPosition(): void {
    if (!this.isAvailable()) {
      this.locationSubject.error('Geolocation is not available');
      return;
    }
    
    // Clear any existing watch
    this.stopWatchingPosition();
    
    Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 10000 },
      (position, error) => {
        if (error) {
          console.error('Watch position error:', error);
          this.locationSubject.error(error);
          return;
        }
        
        if (position) {
          const locationData = this.extractLocationData(position);
          this.locationSubject.next(locationData);
        }
      }
    ).then(watchId => {
      this.watchId = watchId;
    }).catch(error => {
      console.error('Error setting up watch', error);
      this.locationSubject.error(error);
    });
  }

  // Stop watching position
  stopWatchingPosition(): void {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = undefined;
    }
  }

  // Convert Capacitor Position to our LocationData format
  private extractLocationData(position: Position): LocationData {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    };
  }
}