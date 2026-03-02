import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { GreenhousesService } from 'src/app/services/greenhouses.service';

type PreviewZone = {
  code: string; // A, B, C...
  area: number; // m2
};

@Component({
  selector: 'app-greenhouse-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './greenhouse-create.component.html',
  styleUrls: ['./greenhouse-create.component.scss']
})
export class GreenhouseCreateComponent implements OnInit {
  loading = false;

  sectionOptions = [4, 6, 8, 10, 12];
  previewZones: PreviewZone[] = [];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    total_area_m2: [1000, [Validators.required, Validators.min(1)]],
    section_count: [4, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private gh: GreenhousesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildPreview();
    this.form.valueChanges.subscribe(() => this.buildPreview());
  }

  // ✅ USED IN HTML: shows A–D / A–F etc.
  zoneRangeLabel(count: number | null | undefined): string {
    const c = Number(count || 0);
    if (!c) return 'A–A';
    return 'A–' + String.fromCharCode(64 + c);
  }

  private codeFor(i: number) {
    return String.fromCharCode(65 + i); // 0->A
  }

  private buildPreview() {
    const total = Number(this.form.value.total_area_m2 || 0);
    const count = Number(this.form.value.section_count || 4);

    if (!total || total <= 0 || !count || count <= 0) {
      this.previewZones = [];
      return;
    }

    const per = Number((total / count).toFixed(2));
    this.previewZones = Array.from({ length: count }, (_, i) => ({
      code: this.codeFor(i),
      area: per
    }));
  }

  get perZoneArea(): number {
    const total = Number(this.form.value.total_area_m2 || 0);
    const count = Number(this.form.value.section_count || 4);
    if (!total || !count) return 0;
    return Number((total / count).toFixed(2));
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Missing fields',
        text: 'Please enter greenhouse name and total area.'
      });
      return;
    }

    const payload = {
      name: String(this.form.value.name || '').trim(),
      total_area_m2: Number(this.form.value.total_area_m2),
      section_count: Number(this.form.value.section_count || 4)
    };

    this.loading = true;
    this.gh.create(payload).subscribe({
      next: (res) => {
        this.loading = false;

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Greenhouse created',
          showConfirmButton: false,
          timer: 1800,
          timerProgressBar: true
        });

        const id = res?.greenhouse?.id;
        if (id) this.router.navigate(['/greenhouses', id]);
        else this.router.navigate(['/greenhouses']);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Create failed',
          text: err?.error?.message || 'Server error'
        });
      }
    });
  }
}