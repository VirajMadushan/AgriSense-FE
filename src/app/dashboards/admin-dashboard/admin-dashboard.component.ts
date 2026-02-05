import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService, AdminDashboardStats } from 'src/app/services/dashboard.service';

import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexAxisChartSeries,
  ApexTitleSubtitle,
  ApexXAxis
} from 'ng-apexcharts';

type DonutOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  title: ApexTitleSubtitle;
};

type BarOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  stats!: AdminDashboardStats;

  // Donut: ON vs OFF
  statusChart: Partial<DonutOptions> = {
    series: [0, 0],
    chart: { type: 'donut' },
    labels: ['ON', 'OFF'],
    title: { text: 'Device Status' }
  };

  // Bar: Assigned vs Unassigned
  assignmentChart: Partial<BarOptions> = {
    series: [{ name: 'Devices', data: [0, 0] }],
    chart: { type: 'bar' },
    xaxis: { categories: ['Assigned', 'Unassigned'] },
    title: { text: 'Device Assignment' }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;

        // Update charts
        this.statusChart = {
          ...this.statusChart,
          series: [data.devices.on, data.devices.off]
        };

        this.assignmentChart = {
          ...this.assignmentChart,
          series: [{
            name: 'Devices',
            data: [data.devices.assigned, data.devices.unassigned]
          }]
        };
      }
    });
  }
}
