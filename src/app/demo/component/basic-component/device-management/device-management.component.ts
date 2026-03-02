import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { DevicesService, DeviceDto } from 'src/app/services/devices.service';
import { UsersService, UserDto } from 'src/app/services/users.service';
import {
  GreenhousesService,
  GreenhouseWithSectionsDto,
  SectionWithGhDto
} from 'src/app/services/greenhouses.service';

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

  // ✅ Greenhouse dropdown data
  greenhouses: GreenhouseWithSectionsDto[] = [];
  zones: SectionWithGhDto[] = [];

  showModal = false;
  isEdit = false;
  selectedId: number | null = null;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private devicesService: DevicesService,
    private usersService: UsersService,
    private greenhousesService: GreenhousesService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      device_name: ['', Validators.required],
      device_type: ['', Validators.required],
      status: ['OFF', Validators.required],
      location: [''],
      assigned_user_id: [null],

      // ✅ NEW (for zones)
      greenhouse_id: [null],
      section_id: [null]
    });

    this.loadUsers();
    this.loadDevices();
    this.loadGreenhouses();

    // ✅ when greenhouse changes -> update zones dropdown
    this.form.get('greenhouse_id')?.valueChanges.subscribe((ghId) => {
      this.zones = [];
      this.form.patchValue({ section_id: null }, { emitEvent: false });

      if (!ghId) return;

      const selected = this.greenhouses.find((g) => g.id === Number(ghId));
      this.zones = selected?.sections || [];
    });
  }

  // --------------------------
  // LOADERS
  // --------------------------
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

  loadGreenhouses() {
    // ✅ Need backend GET /api/greenhouses/with-sections
    this.greenhousesService.getWithSections().subscribe({
      next: (data) => (this.greenhouses = data || []),
      error: () => {
        // Not fatal, but zones won't work
        Swal.fire({
          icon: 'warning',
          title: 'Greenhouses not loaded',
          text: 'Zone selection will not work until greenhouse data is available.'
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

  // --------------------------
  // MODAL
  // --------------------------
  openCreate() {
    this.showModal = true;
    this.isEdit = false;
    this.selectedId = null;
    this.zones = [];

    this.form.reset({
      status: 'OFF',
      assigned_user_id: null,
      location: '',
      greenhouse_id: null,
      section_id: null
    });
  }

  openEdit(device: any) {
    this.showModal = true;
    this.isEdit = true;
    this.selectedId = device.id || null;

    // If your device list doesn't yet return greenhouse_id/section_id,
    // it will just show blank (works fine).
    const ghId = device.greenhouse_id ?? null;

    this.form.patchValue({
      device_name: device.device_name,
      device_type: device.device_type,
      status: (device.status || 'OFF').toUpperCase(),
      location: device.location || '',
      assigned_user_id: device.assigned_user_id ?? null,
      greenhouse_id: ghId,
      section_id: device.section_id ?? null
    });

    // set zones list for edit mode
    if (ghId) {
      const selected = this.greenhouses.find((g) => g.id === Number(ghId));
      this.zones = selected?.sections || [];
    } else {
      this.zones = [];
    }
  }

  closeModal() {
    this.showModal = false;
  }

  // --------------------------
  // SUBMIT (CREATE/UPDATE + ASSIGN ZONE)
  // --------------------------
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

    // ✅ validate zone selection logic
    const ghId = this.form.value.greenhouse_id;
    const secId = this.form.value.section_id;

    if (ghId && !secId) {
      Swal.fire({
        icon: 'warning',
        title: 'Zone required',
        text: 'Please select a Zone (A–D) for the selected Greenhouse.'
      });
      return;
    }

    const payload: DeviceDto = {
      ...this.form.value,
      status: (this.form.value.status || 'OFF').toUpperCase()
    };

    // Remove greenhouse/section from create payload if your backend POST doesn't accept them
    // (we assign using PATCH after create/update)
    delete (payload as any).greenhouse_id;
    delete (payload as any).section_id;

    if (!this.isEdit) {
      this.devicesService.create(payload).subscribe({
        next: (res: any) => {
          // ✅ Need deviceId to assign zone. If your API doesn't return it,
          // we will re-fetch last inserted another way. Best: modify backend to return insertId.
          const createdId = res?.id || res?.deviceId || res?.insertId;

          if (createdId && ghId && secId) {
            this.devicesService.assignToZone(createdId, Number(ghId), Number(secId)).subscribe({
              next: () => {
                this.afterSuccess('Device created + assigned to zone');
              },
              error: () => {
                this.afterSuccess('Device created (zone assignment failed)');
              }
            });
          } else {
            this.afterSuccess('Device created');
          }
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
          // ✅ Assign/Update zone after update
          this.devicesService
            .assignToZone(this.selectedId!, ghId ? Number(ghId) : null, secId ? Number(secId) : null)
            .subscribe({
              next: () => this.afterSuccess('Device updated + zone updated'),
              error: () => this.afterSuccess('Device updated (zone update failed)')
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

  private afterSuccess(message: string) {
    this.showModal = false;
    this.loadDevices();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true
    });
  }

  // --------------------------
  // DELETE
  // --------------------------
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

  // --------------------------
  // PDF stuff (keep as-is)
  // --------------------------
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
    doc.text(`Created: ${this.formatDate((d as any).created_at)}`, 14, 60);
    doc.text(`Updated: ${this.formatDate((d as any).updated_at)}`, 14, 67);

    doc.save(`device-${(d.device_name || 'report').replace(/\s+/g, '-')}.pdf`);
  }

  downloadAllDevicesPdf() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('AgriSense - Devices Report', 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [['Device', 'Type', 'Status', 'Assigned', 'Location', 'Updated']],
      body: this.devices.map((d: any) => [
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

  downloadDeviceReportPdf(deviceId: number) {
    this.devicesService.getReport(deviceId).subscribe({
      next: ({ device, history }: any) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('AgriSense - Device Report', 14, 16);
        doc.setFontSize(11);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

        const details = [
          ['Device Name', device.device_name || '—'],
          ['Type', device.device_type || '—'],
          ['Status', device.status || '—'],
          ['Assigned To', device.assigned_user_name || 'Unassigned'],
          ['Location', device.location || '—'],
          ['Created At', this.formatDate(device.created_at)],
          ['Updated At', this.formatDate(device.updated_at)]
        ];

        autoTable(doc, {
          startY: 30,
          head: [['Field', 'Value']],
          body: details
        });

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 10,
          head: [['Date/Time', 'Action', 'Old', 'New', 'By', 'Note']],
          body: (history || []).map((h: any) => [
            h.created_at ? new Date(h.created_at).toLocaleString() : '—',
            h.action || '—',
            h.old_value ?? '—',
            h.new_value ?? '—',
            h.created_by_name || 'System',
            h.note || ''
          ]),
          styles: { fontSize: 9 },
          headStyles: { fontSize: 9 }
        });

        doc.save(`device-report-${(device.device_name || 'device').replace(/\s+/g, '-')}.pdf`);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Report failed',
          text: err?.error?.message || 'Could not generate report'
        });
      }
    });
  }
}