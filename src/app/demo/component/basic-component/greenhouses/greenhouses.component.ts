import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { GreenhousesService, GreenhouseDto } from 'src/app/services/greenhouses.service';

@Component({
  selector: 'app-greenhouses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './greenhouses.component.html',
  styleUrls: ['./greenhouses.component.scss']
})
export class GreenhousesComponent implements OnInit {
  loading = false;
  rows: GreenhouseDto[] = [];

  constructor(private gh: GreenhousesService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.gh.getAll().subscribe({
      next: (data) => {
        this.rows = data || [];
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  // ✅ KPI totals
  get totalGreenhouses() {
    return this.rows?.length || 0;
  }

  get totalArea() {
    return (this.rows || []).reduce((sum, g) => sum + Number(g.total_area_m2 || 0), 0);
  }

  get totalZones() {
    return (this.rows || []).reduce((sum, g) => sum + Number(g.section_count || 0), 0);
  }

  // ✅ Navigation
  goCreate() {
    this.router.navigateByUrl('/greenhouses/create');
  }

  openDetails(id: number) {
    this.router.navigateByUrl(`/greenhouses/${id}`);
  }

  // ✅ EDIT
  async editGreenhouse(g: GreenhouseDto) {
    const sectionOptions = [4, 6, 8, 10, 12];

    const { value } = await Swal.fire({
      title: 'Edit Greenhouse',
      html: `
        <div style="text-align:left">
          <label style="font-weight:700">Name</label>
          <input id="gh_name" class="swal2-input" value="${(g.name || '').replace(/"/g, '&quot;')}" />

          <label style="font-weight:700;margin-top:10px;display:block">Total Area (m²)</label>
          <input id="gh_area" type="number" class="swal2-input" value="${Number(g.total_area_m2 || 0)}" />

          <label style="font-weight:700;margin-top:10px;display:block">Zones</label>
          <select id="gh_sections" class="swal2-input">
            ${sectionOptions
              .map((s) => {
                const end = String.fromCharCode(64 + s);
                return `<option value="${s}" ${Number(g.section_count) === s ? 'selected' : ''}>
                  ${s} zones (A–${end})
                </option>`;
              })
              .join('')}
          </select>

          <small style="display:block;margin-top:8px;color:#64748b">
            Note: changing zones will re-generate zones and devices may be unassigned from old zones.
          </small>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      focusConfirm: false,

      // ✅ FIX: always return something (object OR null)
      preConfirm: (): { name: string; total_area_m2: number; section_count: number } | null => {
        const name = (document.getElementById('gh_name') as HTMLInputElement)?.value?.trim();
        const area = Number((document.getElementById('gh_area') as HTMLInputElement)?.value);
        const section_count = Number((document.getElementById('gh_sections') as HTMLSelectElement)?.value);

        if (!name) {
          Swal.showValidationMessage('Name is required');
          return null;
        }
        if (!area || area <= 0) {
          Swal.showValidationMessage('Area must be > 0');
          return null;
        }
        if (!section_count || section_count <= 0) {
          Swal.showValidationMessage('Zones must be valid');
          return null;
        }

        return { name, total_area_m2: area, section_count };
      }
    });

    if (!value) return;

    this.gh.update(g.id, value).subscribe({
      next: () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Greenhouse updated',
          showConfirmButton: false,
          timer: 1600
        });
        this.load();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Update failed',
          text: err?.error?.message || 'Server error'
        });
      }
    });
  }

  // ✅ DELETE
  deleteGreenhouse(g: GreenhouseDto) {
    Swal.fire({
      title: 'Delete greenhouse?',
      text: `Delete "${g.name}"? Zones will be removed and devices will be unassigned.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.gh.delete(g.id).subscribe({
        next: () => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Greenhouse deleted',
            showConfirmButton: false,
            timer: 1600
          });
          this.load();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Delete failed',
            text: err?.error?.message || 'Server error'
          });
        }
      });
    });
  }
}