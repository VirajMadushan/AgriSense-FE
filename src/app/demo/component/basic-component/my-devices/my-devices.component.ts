import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DeviceDto, DevicesService } from 'src/app/services/devices.service';



@Component({
  selector: 'app-my-devices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-devices.component.html',
  styleUrls: ['./my-devices.component.scss']
})
export class MyDevicesComponent implements OnInit {
  devices: DeviceDto[] = [];
  loading = false;

  // for search box
  search = '';

  // disable toggle per device while API running
  toggling: Record<number, boolean> = {};

  constructor(private deviceService: DevicesService) {}

  ngOnInit(): void {
    this.load();
  }

  // computed list
  get filteredDevices(): DeviceDto[] {
    const q = (this.search || '').trim().toLowerCase();
    if (!q) return this.devices;

    return this.devices.filter(d =>
      (d.device_name || '').toLowerCase().includes(q) ||
      (d.device_type || '').toLowerCase().includes(q) ||
      (d.location || '').toLowerCase().includes(q)
    );
  }

  load() {
    this.loading = true;
    this.deviceService.getMyDevices().subscribe({
      next: (data) => {
        this.devices = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Failed to load devices',
          text: err?.error?.message || 'Please try again.'
        });
      }
    });
  }

  // Toggle switch handler
  onToggleChange(d: DeviceDto, ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    const desired = checked ? 'ON' : 'OFF';

    // optimistic UI (optional)
    const prev = d.status;
    d.status = desired;

    this.toggling[d.id] = true;

    this.deviceService.toggleDevice(d.id).subscribe({
      next: (res) => {
        d.status = res.status; // server truth
        this.toggling[d.id] = false;

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `${d.device_name} is now ${d.status}`,
          showConfirmButton: false,
          timer: 1800,
          timerProgressBar: true
        });
      },
      error: (err) => {
        // revert UI
        d.status = prev;
        this.toggling[d.id] = false;

        Swal.fire({
          icon: 'error',
          title: 'Toggle failed',
          text: err?.error?.message || 'Not allowed or server error.'
        });
      }
    });
  }

  // -------- UI helpers for your HTML --------

  dotClass(status: DeviceDto['status']) {
    return status === 'ON' ? 'dot dot-on' : 'dot dot-off';
  }

  badgeClass(status: DeviceDto['status']) {
    return status === 'ON' ? 'badge badge-on' : 'badge badge-off';
  }

  deviceIcon(deviceType: string) {
    const t = (deviceType || '').toLowerCase();
    if (t.includes('pump')) return '💧';
    if (t.includes('sensor')) return '📟';
    if (t.includes('light')) return '💡';
    if (t.includes('fan')) return '🌀';
    return '🔧';
  }

  deviceTypeLabel(deviceType: string) {
    return deviceType || 'Device';
  }

  // "online" is demo (until you add realtime/heartbeat)
  onlineText(d: DeviceDto) {
    // if updated within last 10 minutes -> Online
    const mins = this.minutesSince(d.updated_at);
    if (mins === null) return 'Unknown';
    return mins <= 10 ? 'Online' : 'Offline';
  }

  onlineBadgeClass(d: DeviceDto) {
    const mins = this.minutesSince(d.updated_at);
    if (mins === null) return 'net-unknown';
    return mins <= 10 ? 'net-online' : 'net-offline';
  }

  timeAgo(dateStr?: string) {
    if (!dateStr) return 'N/A';
    const dt = new Date(dateStr);
    const diffMs = Date.now() - dt.getTime();
    if (diffMs < 0) return 'just now';

    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;

    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} h ago`;

    const days = Math.floor(hrs / 24);
    return `${days} d ago`;
  }

  private minutesSince(dateStr?: string): number | null {
    if (!dateStr) return null;
    const dt = new Date(dateStr);
    const diffMs = Date.now() - dt.getTime();
    if (Number.isNaN(dt.getTime())) return null;
    return Math.floor(diffMs / 60000);
  }

  // Mini bars (demo sparkline)
  sparkBars(d: DeviceDto): number[] {
    // deterministic-ish by device id, just for UI
    const seed = (d.id || 1) * 17;
    const bars: number[] = [];
    for (let i = 0; i < 18; i++) {
      const v = Math.abs(Math.sin((seed + i) * 0.7)) * 70 + 10; // 10..80
      bars.push(Math.round(v));
    }
    return bars;
  }

  showInfo(d: DeviceDto) {
    Swal.fire({
      title: d.device_name,
      html: `
        <div style="text-align:left">
          <p><b>Type:</b> ${this.deviceTypeLabel(d.device_type)}</p>
          <p><b>Status:</b> ${d.status}</p>
          <p><b>Location:</b> ${d.location ?? '-'}</p>
          <p><b>Last Updated:</b> ${d.updated_at ? new Date(d.updated_at).toLocaleString() : '-'}</p>
        </div>
      `,
      icon: 'info'
    });
  }
}
