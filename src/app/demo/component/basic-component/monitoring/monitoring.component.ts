import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitoringService, LiveReadingDto } from 'src/app/services/monitoring.service';

declare const Chart: any;

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss']
})
export class MonitoringComponent implements OnInit, OnDestroy {
  loading = false;
  rows: LiveReadingDto[] = [];
  timer: any;

  constructor(private monitoring: MonitoringService) {}

  ngOnInit(): void {
    this.load();
    this.timer = setInterval(() => this.load(false), 5000); // auto refresh
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  load(showLoader = true) {
    if (showLoader) this.loading = true;

    this.monitoring.getLive().subscribe({
      next: (data) => {
        this.rows = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  statusClass(s: string) {
    return (s || '').toUpperCase() === 'ON' ? 'on' : 'off';
  }
}
