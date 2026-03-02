import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GreenhousesService, GreenhouseDto, SectionDto } from 'src/app/services/greenhouses.service';

@Component({
  selector: 'app-greenhouse-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './greenhouse-details.component.html',
  styleUrls: ['./greenhouse-details.component.scss']
})
export class GreenhouseDetailsComponent implements OnInit {
  loading = false;
  greenhouse: GreenhouseDto | null = null;
  sections: SectionDto[] = [];

  constructor(private route: ActivatedRoute, private gh: GreenhousesService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  load(id: number) {
    this.loading = true;
    this.gh.getById(id).subscribe({
      next: (res) => {
        this.greenhouse = res.greenhouse;
        this.sections = res.sections;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}