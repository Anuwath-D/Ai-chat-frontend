import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';

import { HttpClientModule } from '@angular/common/http';
import { ChatCompletionsComponent } from './features/chat-completions/chat-completions.component';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';

@NgModule({
  declarations: [
    AppComponent,
    ChatCompletionsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NzMenuModule,
    BrowserAnimationsModule,
    NzInputModule,
    NzButtonModule,
    NzSpinModule,
    NzSkeletonModule,
    NzDropDownModule,
    NzModalModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
