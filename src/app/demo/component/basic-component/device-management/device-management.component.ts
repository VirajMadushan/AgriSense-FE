import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

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

    this.loadUsers();   // for assignment dropdown
    this.loadDevices(); // list
  }

  loadUsers() {
    // Admin route /api/users requires admin token (you already have)
    this.usersService.getAll().subscribe({
      next: (data) => (this.users = data),
      error: () => {
        // not blocking device page, but inform
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
        this.devices = data;
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
      assigned_user_id: null
    });
  }

  openEdit(device: DeviceDto) {
    this.showModal = true;
    this.isEdit = true;
    this.selectedId = device.id || null;

    this.form.patchValue({
      device_name: device.device_name,
      device_type: device.device_type,
      status: device.status || 'OFF',
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
      // CREATE
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
            timer: 2000,
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
      // UPDATE
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
            timer: 2000,
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
            timer: 2000,
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
}
