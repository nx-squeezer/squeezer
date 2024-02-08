import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxSignalFormsComponent } from './ngx-signal-forms.component';

describe('NgxSignalFormsComponent', () => {
  let component: NgxSignalFormsComponent;
  let fixture: ComponentFixture<NgxSignalFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxSignalFormsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxSignalFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
