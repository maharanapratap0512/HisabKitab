import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JawakEntryComponent } from './jawak-entry.component';

describe('JawakEntryComponent', () => {
  let component: JawakEntryComponent;
  let fixture: ComponentFixture<JawakEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JawakEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JawakEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
