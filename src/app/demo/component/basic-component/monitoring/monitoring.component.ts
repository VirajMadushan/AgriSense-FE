import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from 'chart.js';

import {
  MonitoringService,
  LiveReadingDto,
  ReadingHistoryDto
} from 'src/app/services/monitoring.service';

// Chart.js v4+ register
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss']
})
export class MonitoringComponent implements OnInit, OnDestroy {
  loading = false;
  rows: LiveReadingDto[] = [];
  timer: any;

  selectedDevice: LiveReadingDto | null = null;

  chartLoading = false;

  chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { point: { radius: 2 } },
    plugins: {
      legend: {
        labels: {
          color: '#aaa'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#aaa' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        ticks: { color: '#aaa' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      }
    }
  };

  constructor(private monitoring: MonitoringService) { }

  ngOnInit(): void {
    this.load();
    this.timer = setInterval(() => this.load(false), 5000);
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

        // refresh chart if open
        if (this.selectedDevice) {
          const stillExists = this.rows.find(r => r.device_id === this.selectedDevice?.device_id);
          if (stillExists) {
            this.selectedDevice = stillExists;
            this.loadChart(this.selectedDevice.device_id);
          } else {
            this.selectedDevice = null;
          }
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  statusClass(s: string) {
    return (s || '').toUpperCase() === 'ON' ? 'on' : 'off';
  }

  selectDevice(device: LiveReadingDto) {
    this.selectedDevice = device;
    this.loadChart(device.device_id);
  }

  closeChart() {
    this.selectedDevice = null;
  }

  loadChart(deviceId: number) {
    this.chartLoading = true;

    // ✅ USE YOUR EXISTING METHOD NAME
    this.monitoring.getHistory(deviceId).subscribe({
      next: (rows: ReadingHistoryDto[]) => {
        const labels = rows.map(r =>
          new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );

        this.chartData = {
          labels,
          datasets: [
            {
              data: rows.map(r => Number(r.temperature ?? 0)),
              label: 'Temperature (°C)',
              borderColor: '#ff4d4f',
              backgroundColor: 'rgba(255,77,79,0.15)',
              tension: 0.4,
              fill: true
            },
            {
              data: rows.map(r => Number(r.humidity ?? 0)),
              label: 'Humidity (%)',
              borderColor: '#1890ff',
              backgroundColor: 'rgba(24,144,255,0.15)',
              tension: 0.4,
              fill: true
            },
            {
              data: rows.map(r => Number(r.soil_moisture ?? 0)),
              label: 'Soil Moisture (%)',
              borderColor: '#52c41a',
              backgroundColor: 'rgba(82,196,26,0.15)',
              tension: 0.4,
              fill: true
            }
          ]
        };



        this.chartLoading = false;
      },
      error: () => {
        this.chartLoading = false;
      }
    });
  }
}