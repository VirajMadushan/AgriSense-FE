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
  zoneHealth(s: any): 'ok' | 'warn' | 'critical' | 'no-data' {
  const sensors = Number(s.sensor_count || 0);
  const devices = Number(s.total_devices || 0);

  if (devices === 0) return 'no-data';
  if (sensors === 0) return 'warn';
  if (devices >= 6 && sensors <= 1) return 'critical';
  return 'ok';
}

healthLabel(h: string) {
  if (h === 'ok') return 'OK';
  if (h === 'warn') return 'Warning';
  if (h === 'critical') return 'Critical';
  return 'No Data';
}

get totalDevices() {
  return (this.sections || []).reduce((sum, s: any) => sum + Number(s.total_devices || 0), 0);
}
get totalSensors() {
  return (this.sections || []).reduce((sum, s: any) => sum + Number(s.sensor_count || 0), 0);
}
get totalMotors() {
  return (this.sections || []).reduce((sum, s: any) => sum + Number(s.motor_count || 0), 0);
}
}