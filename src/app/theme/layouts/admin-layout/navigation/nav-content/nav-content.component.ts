import { Component, OnInit, inject, output } from '@angular/core';
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavigationItem } from '../navigation';
import { environment } from 'src/environments/environment';

import { NavGroupComponent } from './nav-group/nav-group.component';
import { NgScrollbarModule } from 'ngx-scrollbar';

// icons
import { IconService } from '@ant-design/icons-angular';
import {
  DashboardOutline,
  CreditCardOutline,
  LoginOutline,
  UserOutline,
  QuestionOutline,
  ChromeOutline,
  FontSizeOutline,
  ProfileOutline,
  BgColorsOutline,
  AntDesignOutline,
  HistoryOutline,
  LineChartOutline,
  RocketOutline
} from '@ant-design/icons-angular/icons';
import { NavigationService } from '../navigation.service';



@Component({
  selector: 'app-nav-content',
  imports: [CommonModule, RouterModule, NavGroupComponent, NgScrollbarModule],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit {
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);
  private iconService = inject(IconService);
  private navService = inject(NavigationService);

  NavCollapsedMob = output();

  // Use dynamic menu from service
  navigations: NavigationItem[] = [];

  title = 'Demo application for version numbering';
  currentApplicationVersion = environment.appVersion;

  windowWidth = window.innerWidth;

  constructor() {
    this.iconService.addIcon(
      ...[
        DashboardOutline,
        CreditCardOutline,
        FontSizeOutline,
        LoginOutline,
        ProfileOutline,
        BgColorsOutline,
        AntDesignOutline,
        UserOutline,
        QuestionOutline,
        HistoryOutline,
        ChromeOutline,
        LineChartOutline,
        RocketOutline
      ]
    );
  }

  ngOnInit() {
    // Load menu based on role
    this.navigations = this.navService.getMenu();

    if (this.windowWidth < 1025) {
      const nav = document.querySelector('.coded-navbar') as HTMLDivElement | null;
      nav?.classList.add('menupos-static');
    }
  }

  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) current_url = baseHref + this.location.path();

    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);

    if (ele) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;

      if (parent?.classList.contains('coded-hasmenu')) {
        parent.classList.add('coded-trigger', 'active');
      } else if (up_parent?.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('coded-trigger', 'active');
      } else if (last_parent?.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('coded-trigger', 'active');
      }
    }
  }

  navMob() {
    const el = document.querySelector('app-navigation.coded-navbar') as HTMLElement | null;
    if (this.windowWidth < 1025 && el?.classList.contains('mob-open')) {
      this.NavCollapsedMob.emit();
    }
  }
}
