import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MyDeviceDto {
  id: number;
  device_name: string;
  device_type: string;
  status: 'ON' | 'OFF';
  location?: string | null;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class MyDevicesService {
  private myDevicesUrl = 'http://localhost:4000/api/my/devices';
  private controlUrl = 'http://localhost:4000/api/device-control';

  constructor(private http: HttpClient) {}

  getMyDevices(): Observable<MyDeviceDto[]> {
    return this.http.get<MyDeviceDto[]>(this.myDevicesUrl);
  }

  toggleDevice(id: number, status: 'ON' | 'OFF') {
    return this.http.post(`${this.controlUrl}/${id}/toggle`, { status });
  }

  isOnline(d: MyDeviceDto) {
  if (!d.updated_at) return false;
  const last = new Date(d.updated_at).getTime();
  if (Number.isNaN(last)) return false;
  const diffMin = (Date.now() - last) / 60000;
  return diffMin <= 5;
}

onlineBadgeClass(d: MyDeviceDto) {
  return this.isOnline(d) ? 'net-online' : 'net-offline';
}

onlineText(d: MyDeviceDto) {
  return this.isOnline(d) ? 'Online' : 'Offline';
}

}
