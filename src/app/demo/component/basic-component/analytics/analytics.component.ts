import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { AnalyticsService, AnalyticsSummary, AlertDto } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  loading = false;
  summary: AnalyticsSummary | null = null;
  alerts: AlertDto[] = [];
  timer: any;

  constructor(private analytics: AnalyticsService) {}

  ngOnInit(): void {
    this.refreshAll();

    // auto refresh every 30s
    this.timer = setInterval(() => this.refreshAll(false), 30000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  refreshAll(showToast = false) {
    this.loadSummary();
    this.loadAlerts();

    if (showToast) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Analytics refreshed',
        showConfirmButton: false,
        timer: 1200
      });
    }
  }

  loadSummary() {
    this.loading = true;
    this.analytics.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  loadAlerts() {
    this.analytics.getAlerts().subscribe({
      next: (data) => (this.alerts = data || []),
      error: () => (this.alerts = [])
    });
  }

  runNow() {
    Swal.fire({
      title: 'Run alert checks?',
      text: 'This will analyze latest sensor readings and generate new alerts.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Run',
      cancelButtonText: 'Cancel'
    }).then((r) => {
      if (!r.isConfirmed) return;

      this.analytics.run().subscribe({
        next: () => {
          this.refreshAll(true);
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: err?.error?.message || 'Run failed'
          });
        }
      });
    });
  }

  severityClass(s: string) {
    const v = (s || '').toUpperCase();
    if (v === 'HIGH') return 'sev-high';
    if (v === 'MEDIUM') return 'sev-med';
    return 'sev-low';
  }
}