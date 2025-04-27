// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideIonicAngular, IonicRouteStrategy } from '@ionic/angular/standalone';
import { RouteReuseStrategy } from '@angular/router';

import { routes } from './app.routes';

// Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // Angular core providers
    provideRouter(routes),
    provideHttpClient(),
    
    // Ionic providers
    provideIonicAngular(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    
    // Firebase providers
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideFirestore(() => getFirestore())
    ), provideFirebaseApp(() => initializeApp({ projectId: "geolocation-8950e", appId: "1:193233995487:web:bec801c9ec66fd0563cb6a", storageBucket: "geolocation-8950e.firebasestorage.app", apiKey: "AIzaSyBYw3UmH8QRpdtJv8tnXsgQY7R1JE6ah8w", authDomain: "geolocation-8950e.firebaseapp.com", messagingSenderId: "193233995487", measurementId: "G-JST9CK13DS" })), provideFirestore(() => getFirestore())
  ]
};