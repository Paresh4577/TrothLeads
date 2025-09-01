import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry } from "@angular/material/icon";



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class IconsModule {
    /**
   * Constructor
   */
    constructor(private domSanitizer: DomSanitizer,
      private iconRegistry: MatIconRegistry) {

    //Register Icons
    this.iconRegistry.addSvgIconSet(this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/material-twotone.svg'));
    this.iconRegistry.addSvgIconSetInNamespace('mat_outline', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/material-outline.svg'));
    this.iconRegistry.addSvgIconSetInNamespace('mat_solid', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/material-solid.svg'));
    this.iconRegistry.addSvgIconSetInNamespace('feather', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/feather.svg'));
    this.iconRegistry.addSvgIconSetInNamespace('heroicons_outline', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/heroicons-outline.svg'));
    this.iconRegistry.addSvgIconSetInNamespace('heroicons_solid', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/heroicons-solid.svg'));
    }

 }
