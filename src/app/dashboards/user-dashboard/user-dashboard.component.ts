import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService, UserDashboardStats } from 'src/app/services/dashboard.service';

import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexTitleSubtitle
} from 'ng-apexcharts';

type DonutOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {

  loading = true;
  me!: UserDashboardStats['me'];
  devices!: UserDashboardStats['devices'];

  donutOptions: Partial<DonutOptions> = {
    series: [0, 0],
    chart: { type: 'donut' },
    labels: ['ON', 'OFF'],
    title: { text: 'My Devices Status' }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getUserStats().subscribe({
      next: (data) => {
        this.me = data.me;
        this.devices = data.devices;

        this.donutOptions = {
          ...this.donutOptions,
          series: [this.devices.on, this.devices.off]
        };

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
