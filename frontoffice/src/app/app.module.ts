import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';

import { AppComponent } from './app.component';
import { TestingComponent } from './testing/testing.component';
import { HeroFormComponent } from './hero-form/hero-form.component';


@NgModule({
  declarations: [
    AppComponent,
    TestingComponent,
    HeroFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
