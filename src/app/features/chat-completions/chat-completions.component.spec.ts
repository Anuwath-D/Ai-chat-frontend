import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatCompletionsComponent } from './chat-completions.component';

describe('ChatCompletionsComponent', () => {
  let component: ChatCompletionsComponent;
  let fixture: ComponentFixture<ChatCompletionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatCompletionsComponent]
    });
    fixture = TestBed.createComponent(ChatCompletionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
