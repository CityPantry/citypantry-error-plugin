import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ObjectLineComponent } from './object-line/object-line.component';
import { ArrayLineComponent } from './array-line/array-line.component';
import { PrimitiveLineComponent } from './primitive-line/primitive-line.component';
import { LineComponent } from './line/line.component';
import { ReduxStateComponent } from './redux-state/redux-state.component';


@NgModule({
  declarations: [
    AppComponent,
    ObjectLineComponent,
    ArrayLineComponent,
    PrimitiveLineComponent,
    LineComponent,
    ReduxStateComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
