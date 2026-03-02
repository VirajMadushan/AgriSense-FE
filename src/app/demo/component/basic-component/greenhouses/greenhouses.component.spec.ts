import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GreenhousesComponent } from './greenhouses.component';

describe('GreenhousesComponent', () => {
  let component: GreenhousesComponent;
  let fixture: ComponentFixture<GreenhousesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreenhousesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GreenhousesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
