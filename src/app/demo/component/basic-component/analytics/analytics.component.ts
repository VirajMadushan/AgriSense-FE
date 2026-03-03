import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { forkJoin, Subscription } from 'rxjs';

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
  sub?: Subscription;

  constructor(private analytics: AnalyticsService) {}

  ngOnInit(): void {
    this.refreshAll();

    // auto refresh every 30s
    this.timer = setInterval(() => this.refreshAll(false), 30000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.sub?.unsubscribe();
  }

  refreshAll(showToast = false) {
    this.loading = true;

    this.sub?.unsubscribe();
    this.sub = forkJoin({
      summary: this.analytics.getSummary(),
      alerts: this.analytics.getAlerts()
    }).subscribe({
      next: ({ summary, alerts }) => {
        this.summary = summary;
        this.alerts = alerts || [];
        this.loading = false;

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
      },
      error: (err) => {
        this.loading = false;
        console.error('Analytics load error:', err);

        const code = err?.status;
        if (code === 401) {
          Swal.fire({ icon: 'error', title: 'Unauthorized', text: 'Login expired. Please login again.' });
        } else if (code === 403) {
          Swal.fire({ icon: 'error', title: 'Forbidden', text: 'You do not have permission to view analytics.' });
        } else {
          Swal.fire({ icon: 'error', title: 'Failed', text: err?.error?.message || 'Could not load analytics data.' });
        }
      }
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
        next: (res) => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Scanned ${res?.scannedDevices ?? 0} devices`,
            showConfirmButton: false,
            timer: 1400
          });
          this.refreshAll(false);
        },
        error: (err) => {
          console.error('Run analytics error:', err);
          Swal.fire({
            icon: 'error',
            title: 'Run failed',
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