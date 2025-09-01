import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { authService } from '../../auth/auth.service';
@Component({
  selector: 'app-privacy-policy',
  standalone: false,
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  privacyPolicyHtml: SafeHtml = '';
  privacyPolicyRawHtml: string = '';
  isEditing: boolean = false;

  constructor(
    private authService: authService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadPrivacyPolicy();
  }

  loadPrivacyPolicy(): void {
    this.authService.getPrivacyPolicy().subscribe(html => {
      this.privacyPolicyRawHtml = html;
      this.privacyPolicyHtml = this.sanitizer.bypassSecurityTrustHtml(html);
      console.log('Loaded Privacy Policy:', this.privacyPolicyHtml);
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  onEditorInput(event: Event): void {
    const target = event.target as HTMLDivElement;
    this.privacyPolicyRawHtml = target.innerHTML;
  }

  saveChanges(): void {
    this.privacyPolicyHtml = this.sanitizer.bypassSecurityTrustHtml(this.privacyPolicyRawHtml);
    // Optionally save to backend:
    // this.authService.updatePrivacyPolicy(this.privacyPolicyRawHtml).subscribe();
    this.isEditing = false;
  }
}
