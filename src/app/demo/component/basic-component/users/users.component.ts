import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { UsersService, UserDto } from 'src/app/services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: UserDto[] = [];
  loading = false;

  showModal = false;
  isEdit = false;
  selectedId: number | null = null;

  form!: FormGroup;

  constructor(private fb: FormBuilder, private usersService: UsersService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', Validators.required],
      password: [''] // required only when creating
    });

    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err?.error?.message || 'Failed to load users'
        });
      }
    });
  }

  openCreate() {
    this.showModal = true;
    this.isEdit = false;
    this.selectedId = null;

    this.form.reset({ role: 'user' });
    this.form.get('password')?.setValidators([Validators.required]);
    this.form.get('password')?.updateValueAndValidity();
  }

  openEdit(user: UserDto) {
    this.showModal = true;
    this.isEdit = true;
    this.selectedId = user.id || null;

    this.form.patchValue({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      password: ''
    });

    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
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
        text: 'Please fill all required fields correctly.'
      });
      return;
    }

    const payload: UserDto = { ...this.form.value };

    if (!this.isEdit) {
      // CREATE
      this.usersService.create(payload).subscribe({
        next: () => {
          this.showModal = false;
          this.loadUsers();

          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'User created',
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

      // Don't send empty password on edit
      if (!payload.password) delete payload.password;

      this.usersService.update(this.selectedId, payload).subscribe({
        next: () => {
          this.showModal = false;
          this.loadUsers();

          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'User updated',
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

  // DELETE (modern confirm)
  remove(user: UserDto) {
    if (!user.id) return;

    Swal.fire({
      title: 'Delete user?',
      text: `Delete ${user.email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.usersService.delete(user.id!).subscribe({
        next: () => {
          this.loadUsers();

          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'User deleted',
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
