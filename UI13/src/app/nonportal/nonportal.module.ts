import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MudModule } from '../mud/mud.module';
import { OrbitComponent } from './orbit/orbit.component';
import { Uni1993Component } from './uni1993/uni1993.component';
import { UnitopiaComponent } from './unitopia/unitopia.component';
import { PrimeModule } from '../prime.module';

@NgModule({
  declarations: [
    UnitopiaComponent, 
    OrbitComponent, 
    Uni1993Component
    
  ],
  imports: [
    CommonModule,
    MudModule,
    PrimeModule
  ],
  exports:[
    UnitopiaComponent, 
    OrbitComponent, 
    Uni1993Component
    ]
})
export class NonportalModule { }
