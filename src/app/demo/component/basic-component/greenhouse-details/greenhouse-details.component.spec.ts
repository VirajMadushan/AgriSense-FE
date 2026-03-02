import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GreenhouseDetailsComponent } from './greenhouse-details.component';

describe('GreenhouseDetailsComponent', () => {
  let component: GreenhouseDetailsComponent;
  let fixture: ComponentFixture<GreenhouseDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreenhouseDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GreenhouseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
