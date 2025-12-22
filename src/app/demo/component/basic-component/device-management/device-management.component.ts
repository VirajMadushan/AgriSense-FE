import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { DevicesService, DeviceDto } from 'src/app/services/devices.service';
import { UsersService, UserDto } from 'src/app/services/users.service';

@Component({
  selector: 'app-device-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './device-management.component.html',
  styleUrls: ['./device-management.component.scss']
})
export class DeviceManagementComponent implements OnInit {
  devices: DeviceDto[] = [];
  users: UserDto[] = [];
  loading = false;

  showModal = false;
  isEdit = false;
  selectedId: number | null = null;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private devicesService: DevicesService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      device_name: ['', Validators.required],
      device_type: ['', Validators.required],
      status: ['OFF', Validators.required],
      location: [''],
      assigned_user_id: [null]
    });

    this.loadUsers();
    this.loadDevices();
  }

  loadUsers() {
    this.usersService.getAll().subscribe({
      next: (data) => (this.users = data || []),
      error: () => {
        Swal.fire({
          icon: 'warning',
          title: 'Users not loaded',
          text: 'Device assignment dropdown may not work.'
        });
      }
    });
  }

  loadDevices() {
    this.loading = true;
    this.devicesService.getAll().subscribe({
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

  openCreate() {
    this.showModal = true;
    this.isEdit = false;
    this.selectedId = null;

    this.form.reset({
      status: 'OFF',
      assigned_user_id: null,
      location: ''
    });
  }

  openEdit(device: DeviceDto) {
    this.showModal = true;
    this.isEdit = true;
    this.selectedId = device.id || null;

    this.form.patchValue({
      device_name: device.device_name,
      device_type: device.device_type,
      status: (device.status || 'OFF').toUpperCase(),
      location: device.location || '',
      assigned_user_id: device.assigned_user_id ?? null
    });
  }

  closeModal() {
    this.showModal = false;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Validation error',
        text: 'Please fill all required fields.'
      });
      return;
    }

    const payload: DeviceDto = {
      ...this.form.value,
      status: (this.form.value.status || 'OFF').toUpperCase()
    };

    if (!this.isEdit) {
      this.devicesService.create(payload).subscribe({
        next: () => {
          this.showModal = false;
          this.loadDevices();
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Device created',
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Create failed',
            text: err?.error?.message || 'Something went wrong'
          });
        }
      });
    } else {
      if (!this.selectedId) return;

      this.devicesService.update(this.selectedId, payload).subscribe({
        next: () => {
          this.showModal = false;
          this.loadDevices();
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Device updated',
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Update failed',
            text: err?.error?.message || 'Something went wrong'
          });
        }
      });
    }
  }

  remove(device: DeviceDto) {
    if (!device.id) return;

    Swal.fire({
      title: 'Delete device?',
      text: `Delete ${device.device_name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.devicesService.delete(device.id!).subscribe({
        next: () => {
          this.loadDevices();
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Device deleted',
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Delete failed',
            text: err?.error?.message || 'Something went wrong'
          });
        }
      });
    });
  }

  // ==========================
  // PDF REPORTS
  // ==========================
  downloadDevicePdf(d: DeviceDto) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('AgriSense - Device Report', 14, 15);

    doc.setFontSize(11);
    doc.text(`Device: ${d.device_name}`, 14, 25);
    doc.text(`Type: ${d.device_type}`, 14, 32);
    doc.text(`Status: ${d.status}`, 14, 39);
    doc.text(`Assigned To: ${d.assigned_user_name || '—'}`, 14, 46);
    doc.text(`Location: ${d.location || '—'}`, 14, 53);
    doc.text(`Created: ${this.formatDate(d.created_at)}`, 14, 60);
    doc.text(`Updated: ${this.formatDate(d.updated_at)}`, 14, 67);

    doc.save(`device-${(d.device_name || 'report').replace(/\s+/g, '-')}.pdf`);
  }

  downloadAllDevicesPdf() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('AgriSense - Devices Report', 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [['Device', 'Type', 'Status', 'Assigned', 'Location', 'Updated']],
      body: this.devices.map((d) => [
        d.device_name,
        d.device_type,
        d.status,
        d.assigned_user_name || '—',
        d.location || '—',
        this.formatDate(d.updated_at)
      ])
    });

    doc.save('devices-report.pdf');
  }

  formatDate(dateStr?: string) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
  }

  // ==========================
  // HISTORY VIEW (needs API)
  // ==========================
  viewHistory(deviceId: number) {
    this.devicesService.getHistory(deviceId).subscribe({
      next: (logs: any[]) => {
        const html =
          (logs || [])
            .map(
              (l: any) => `
              <div style="text-align:left;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #eee;">
                <b>${l.action || 'ACTION'}</b> | ${l.old_value ?? '-'} → ${l.new_value ?? '-'}
                <br><small>${new Date(l.created_at).toLocaleString()} by ${l.created_by_name || 'System'}</small>
              </div>
            `
            )
            .join('') || '<p>No history found</p>';

        Swal.fire({
          title: 'Device History',
          width: 700,
          html,
          confirmButtonText: 'Close'
        });
      },
      error: (err) =>
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.error?.message || 'Failed to load history'
        })
    });
  }
}
