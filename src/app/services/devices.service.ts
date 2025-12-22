import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DeviceDto {
  id?: number;
  device_name: string;
  device_type: string;
  status: 'ON' | 'OFF';
  location?: string | null;
  assigned_user_id?: number | null;
  assigned_user_name?: string | null;
}

@Injectable({ providedIn: 'root' })
export class DevicesService {
  private baseUrl = 'http://localhost:4000/api/devices';
  constructor(private http: HttpClient) {}

  getAll(): Observable<DeviceDto[]> {
    return this.http.get<DeviceDto[]>(this.baseUrl);
  }

  create(device: DeviceDto) {
    return this.http.post(this.baseUrl, device);
  }

  update(id: number, device: DeviceDto) {
    return this.http.put(`${this.baseUrl}/${id}`, device);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
