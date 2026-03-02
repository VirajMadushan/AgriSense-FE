import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService, AdminDashboardStats, GreenhouseOverview } from 'src/app/services/dashboard.service';

import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexAxisChartSeries,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend,
  ApexTooltip
} from 'ng-apexcharts';

type DonutOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  title: ApexTitleSubtitle;
  legend?: ApexLegend;
};

type BarOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  tooltip?: ApexTooltip;
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  loading = false;

  stats!: AdminDashboardStats;
  overview!: GreenhouseOverview;

  // ===== existing charts =====
  statusChart: Partial<DonutOptions> = {
    series: [0, 0],
    chart: { type: 'donut' },
    labels: ['ON', 'OFF'],
    title: { text: 'Device Status' },
    legend: { position: 'right' }
  };

  assignmentChart: Partial<BarOptions> = {
    series: [{ name: 'Devices', data: [0, 0] }],
    chart: { type: 'bar' },
    xaxis: { categories: ['Assigned', 'Unassigned'] },
    title: { text: 'Device Assignment' },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
    dataLabels: { enabled: true }
  };

  // ===== NEW: devices per greenhouse =====
  greenhouseDevicesChart: Partial<BarOptions> = {
    series: [{ name: 'Devices', data: [] }],
    chart: { type: 'bar' },
    xaxis: { categories: [] },
    title: { text: 'Devices per Greenhouse' },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
    dataLabels: { enabled: true }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;

    // 1) existing admin stats
    this.dashboardService.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;

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

        // 2) new greenhouse overview
        this.dashboardService.getGreenhouseOverview().subscribe({
          next: (ov) => {
            this.overview = ov;

            // Build devices per greenhouse chart
            const names = ov.greenhouses.map(g => g.name);
            const counts = ov.greenhouses.map(g => Number(g.devices || 0));

            this.greenhouseDevicesChart = {
              ...this.greenhouseDevicesChart,
              xaxis: { categories: names },
              series: [{ name: 'Devices', data: counts }]
            };

            this.loading = false;
          },
          error: () => (this.loading = false)
        });
      },
      error: () => (this.loading = false)
    });
  }

  // ===== Zone health =====
  zoneHealth(z: any): 'healthy' | 'warning' | 'critical' | 'no-data' {
    if (z?.avg_temp == null && z?.avg_soil == null && z?.avg_hum == null) return 'no-data';

    const t = Number(z.avg_temp ?? 0);
    const s = Number(z.avg_soil ?? 0);

    // simple IoT thresholds (you can change later)
    if (s > 0 && s < 30) return 'critical';
    if (t > 35) return 'critical';

    if (s > 0 && s < 40) return 'warning';
    if (t >= 32 && t <= 35) return 'warning';

    return 'healthy';
  }

  fmt(n: any, suffix = ''): string {
    if (n == null || Number.isNaN(Number(n))) return '--';
    return `${Number(n).toFixed(0)}${suffix}`;
  }
}