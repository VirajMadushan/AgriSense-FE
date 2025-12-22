import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { MyDevicesService, MyDeviceDto } from 'src/app/services/my-devices.service';

@Component({
  selector: 'app-my-devices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-devices.component.html',
  styleUrls: ['./my-devices.component.scss']
})
export class MyDevicesComponent implements OnInit {
  devices: MyDeviceDto[] = [];
  loading = false;
  search = '';

  toggling: Record<number, boolean> = {};

  constructor(private myDevicesService: MyDevicesService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.myDevicesService.getMyDevices().subscribe({
      next: (data) => {
        this.devices = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err?.error?.message || 'Failed to load devices'
        });
      }
    });
  }

  get filteredDevices() {
    const q = (this.search || '').toLowerCase().trim();
    if (!q) return this.devices;
    return this.devices.filter(d =>
      (d.device_name || '').toLowerCase().includes(q) ||
      (d.device_type || '').toLowerCase().includes(q) ||
      (d.location || '').toLowerCase().includes(q)
    );
  }

  // UI helpers
  badgeClass(status: 'ON' | 'OFF') {
    return status === 'ON' ? 'badge-on' : 'badge-off';
  }

  dotClass(status: 'ON' | 'OFF') {
    return status === 'ON' ? 'dot dot-on dot-pulse' : 'dot dot-off';
  }

  // "time ago" text
  timeAgo(dateStr?: string) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const diffMs = Date.now() - d.getTime();
    if (Number.isNaN(diffMs)) return '—';

    const sec = Math.floor(diffMs / 1000);
    if (sec < 10) return 'just now';
    if (sec < 60) return `${sec}s ago`;

    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;

    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;

    const day = Math.floor(hr / 24);
    if (day < 30) return `${day}d ago`;

    const mo = Math.floor(day / 30);
    if (mo < 12) return `${mo}mo ago`;

    const yr = Math.floor(mo / 12);
    return `${yr}y ago`;
  }

  // Online/Offline (based on updated_at)
  isOnline(d: MyDeviceDto) {
    if (!d.updated_at) return false;
    const last = new Date(d.updated_at).getTime();
    if (Number.isNaN(last)) return false;

    const diffMin = (Date.now() - last) / 60000;
    return diffMin <= 5; // online if updated within 5 minutes
  }

  onlineBadgeClass(d: MyDeviceDto) {
    return this.isOnline(d) ? 'net-online' : 'net-offline';
  }

  onlineText(d: MyDeviceDto) {
    return this.isOnline(d) ? 'Online' : 'Offline';
  }

  // Icons by type
  deviceIcon(type: string) {
    const t = (type || '').toLowerCase();
    if (t.includes('sensor')) return '🧪';
    if (t.includes('pump') || t.includes('motor')) return '💧';
    if (t.includes('camera') || t.includes('cctv')) return '📷';
    if (t.includes('light')) return '💡';
    return '🔌';
  }

  deviceTypeLabel(type: string) {
    return (type || 'Device').trim();
  }

  // Mini preview spark bars (placeholder)
  sparkBars(d: MyDeviceDto) {
    const seed = (d.id || 1) * 17;
    const bars = Array.from({ length: 14 }).map((_, i) => {
      const v = (seed + i * 13) % 100;
      return 20 + (v % 70); // 20..89
    });

    // if offline, make bars smaller
    if (!this.isOnline(d)) return bars.map(x => Math.max(12, Math.floor(x * 0.5)));
    return bars;
  }

  // SweetAlert info
  showInfo(d: MyDeviceDto) {
    Swal.fire({
      title: 'Device Info',
      icon: 'info',
      html:
        `<b>Name:</b> ${d.device_name}<br>` +
        `<b>Type:</b> ${d.device_type}<br>` +
        `<b>Status:</b> ${d.status}` +
        (d.location ? `<br><b>Location:</b> ${d.location}` : '') +
        (d.updated_at ? `<br><b>Last updated:</b> ${new Date(d.updated_at).toLocaleString()}` : '')
    });
  }

  // Toggle switch handler
  async onToggleChange(device: MyDeviceDto, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const newStatus: 'ON' | 'OFF' = checkbox.checked ? 'ON' : 'OFF';

    const result = await Swal.fire({
      title: 'Confirm',
      text: `Turn ${newStatus} ${device.device_name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, turn ${newStatus}`,
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      checkbox.checked = device.status === 'ON'; // revert
      return;
    }

    this.toggling[device.id] = true;

    this.myDevicesService.toggleDevice(device.id, newStatus).subscribe({
      next: () => {
        device.status = newStatus;
        device.updated_at = new Date().toISOString(); // update UI instantly
        this.toggling[device.id] = false;

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `${device.device_name} is ${newStatus}`,
          showConfirmButton: false,
          timer: 1800,
          timerProgressBar: true
        });
      },
      error: (err) => {
        this.toggling[device.id] = false;
        checkbox.checked = device.status === 'ON'; // revert if API failed

        Swal.fire({
          icon: 'error',
          title: 'Action failed',
          text: err?.error?.message || 'Could not update device status'
        });
      }
    });
  }
}
