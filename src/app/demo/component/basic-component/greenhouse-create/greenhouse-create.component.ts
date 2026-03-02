import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GreenhousesService } from 'src/app/services/greenhouses.service';

@Component({
  selector: 'app-greenhouse-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './greenhouse-create.component.html',
  styleUrls: ['./greenhouse-create.component.scss']
})
export class GreenhouseCreateComponent {
  saving = false;

  name = '';
  totalArea = 1000;
  sectionCount = 4;

  constructor(private gh: GreenhousesService, private router: Router) {}

  sectionCode(i: number) {
    return String.fromCharCode(65 + i); // A,B,C,D...
  }

  get perSection(): number {
    const total = Number(this.totalArea || 0);
    const count = Math.max(1, Number(this.sectionCount || 4));
    return Number((total / count).toFixed(2));
  }

  get previewArray(): number[] {
    return Array.from({ length: this.sectionCount }, (_, i) => i);
  }

  submit() {
    if (!this.name.trim()) return;

    this.saving = true;
    this.gh.create({
      name: this.name.trim(),
      total_area_m2: Number(this.totalArea),
      section_count: Number(this.sectionCount)
    }).subscribe({
      next: (res) => {
        this.saving = false;
        this.router.navigate(['/greenhouses', res.greenhouse.id]);
      },
      error: () => (this.saving = false)
    });
  }
}