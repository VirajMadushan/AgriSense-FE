import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

  constructor(private gh: GreenhousesService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.gh.getAll().subscribe({
      next: (data) => {
        this.rows = data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}