import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeData } from './realtime-data';

describe('RealtimeData', () => {
  let component: RealtimeData;
  let fixture: ComponentFixture<RealtimeData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealtimeData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealtimeData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
