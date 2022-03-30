import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JawakComponent } from './jawak.component';

describe('JawakComponent', () => {
  let component: JawakComponent;
  let fixture: ComponentFixture<JawakComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JawakComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JawakComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
