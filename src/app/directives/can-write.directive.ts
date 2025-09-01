import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appCanWrite]'
})
  
export class CanWriteDirective implements OnInit {
  @Input('appCanWrite') moduleName: string = '';

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}

  ngOnInit() {
    const permissions = JSON.parse(localStorage.getItem('modulePermissions') || '[]');
    const permission = permissions.find((p: any) => p.ModuleName === this.moduleName);
    console.log("inside root ",permission)
    if (permission && permission.CanWrite) {

      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}



@Directive({
  selector: '[appCanRead]'
})
export class CanReadDirective {
  @Input('appCanRead') moduleName: string = '';

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}

  ngOnInit() {
    const permissions = JSON.parse(localStorage.getItem('modulePermissions') || '[]');
    const module = permissions.find((p: any) => p.ModuleName === this.moduleName);

    if (module?.CanRead) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}






@Directive({
  selector: '[appCanDelete]'
})
export class CanDeleteDirective {
  @Input('appCanDelete') moduleName: string = '';

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}

  
   ngOnInit() {
    const permissions = JSON.parse(localStorage.getItem('modulePermissions') || '[]');
    const permission = permissions.find((p: any) => p.ModuleName === this.moduleName);
    console.log("inside root ",permission)
    if (permission && permission.CanDelete) {

      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

@Directive({
  selector: '[appCanAccess]'
})
export class CanAccessDirective {
  @Input('appCanAccess') moduleName: string = '';

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}

  ngOnInit() {
    const permissions = JSON.parse(localStorage.getItem('modulePermissions') || '[]');
    const module = permissions.find((p: any) => p.ModuleName === this.moduleName);

    const hasAccess = module?.CanRead || module?.CanWrite || module?.CanDelete;

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

