import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
  errorMsg = '';
  successMsg = '';

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
        this.errorMsg = err?.error?.message || 'Failed to load users';
      }
    });
  }

  openCreate() {
    this.showModal = true;
    this.isEdit = false;
    this.selectedId = null;
    this.errorMsg = '';
    this.successMsg = '';
    this.form.reset({ role: 'user' });
    this.form.get('password')?.setValidators([Validators.required]);
    this.form.get('password')?.updateValueAndValidity();
  }

  openEdit(user: UserDto) {
    this.showModal = true;
    this.isEdit = true;
    this.selectedId = user.id || null;
    this.errorMsg = '';
    this.successMsg = '';

    this.form.patchValue({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      password: '' // optional when editing
    });

    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
  }

  closeModal() {
    this.showModal = false;
  }

  submit() {
    this.errorMsg = '';
    this.successMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: UserDto = this.form.value;

    if (!this.isEdit) {
      this.usersService.create(payload).subscribe({
        next: () => {
          this.successMsg = 'User created successfully';
          this.showModal = false;
          this.loadUsers();
        },
        error: (err) => (this.errorMsg = err?.error?.message || 'Create failed')
      });
    } else {
      if (!this.selectedId) return;

      // Don't send empty password on edit
      if (!payload.password) delete payload.password;

      this.usersService.update(this.selectedId, payload).subscribe({
        next: () => {
          this.successMsg = 'User updated successfully';
          this.showModal = false;
          this.loadUsers();
        },
        error: (err) => (this.errorMsg = err?.error?.message || 'Update failed')
      });
    }
  }

  remove(user: UserDto) {
    if (!user.id) return;

    const ok = confirm(`Delete user ${user.email}?`);
    if (!ok) return;

    this.usersService.delete(user.id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => (this.errorMsg = err?.error?.message || 'Delete failed')
    });
  }
}
