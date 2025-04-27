// src/app/models/task.model.ts
export interface Task {
    id?: string;
    title: string;
    description?: string;
    completed: boolean;
    location: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    radius: number; // in meters - defines how close you need to be to trigger notification
    createdAt: Date;
    updatedAt?: Date;
  }