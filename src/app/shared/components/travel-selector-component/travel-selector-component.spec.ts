import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelSelectorComponent } from './travel-selector-component';

describe('TravelSelectorComponent', () => {
  let component: TravelSelectorComponent;
  let fixture: ComponentFixture<TravelSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
