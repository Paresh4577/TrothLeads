import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { authService } from '../../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-claim',
  standalone: false,
  templateUrl: './add-claim.component.html',
  styleUrl: './add-claim.component.scss'
})
export class AddClaimComponent {
  claimForm: FormGroup;
  currentSection: string = 'documents';
  filePreviewUrls: { [key: number]: string } = {};
  previewUrls: Map<number, string> = new Map(); // index -> blob URL
  id = 0;
  products: any[] = [];
  claimStatuses: any[] = [];
  companies: any[] = [];
  users: any[] = [];
  employees: any[] = [];
  policies: any[] = [];
  isEditing: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  uploadedFiles: Map<number, File> = new Map(); // Store uploaded files by index
  documentOptions: string[] = ['Aadhaar Card', 'PAN Card', 'Driving License', 'RC Book'];


  constructor(private fb: FormBuilder, private authService: authService, private router: Router, private route: ActivatedRoute) {
    this.claimForm = this.fb.group({
      claimId: [null],
      policyId: [null, Validators.required], // Required as it's critical for the claim
      ClaimStatusId: [this.isEditing ? null : 11, Validators.required],
      assignedUser: ['', Validators.required],
      claimType: [null, Validators.required],
      fullName: [''],
      phoneNumber: ['', Validators.required, Validators.pattern('^[0-9]{10}$')], // Optional but must be valid if provided
      email: ['', Validators.required, Validators.email], // Optional but must be valid if provided
      submissionDate: [this.getTodayDate(), Validators.required],
      resolutionDate: [null, Validators.required],
      claimStatus: [null, Validators.required],
      createdBy: ['System', Validators.required],
      userId: [null, Validators.required],
      CompanyId: [null, Validators.required],
      empId: [null],
      productId: [null, Validators.required],
      description: ['', Validators.required],
      claimAmount: ['', Validators.required, Validators.min(0)], // Optional but must be non-negative if provided
      approvedAmount: [null, Validators.required],
      submissionMethod: ['Mobile'],
      platform: ['iOS'],
      device: ['iPhone'],
      claimDocuments: this.fb.array([
        this.fb.group({
          docName: [''],
          status: [''],
          orderNo: [1],
          docPath: ['']// Added for file path tracking
        }),
      ]),
    });
  }

  get claimDocument(): FormArray {
    return this.claimForm.get('claimDocuments') as FormArray;
  }

  getTodayDate(): string {
    const now = new Date();
    console.log("Now", now)
    return now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
  }


  loadClaimData(claimId: number): void {
    this.authService.getClaimById(claimId).subscribe({
      next: (claim) => {
        console.log('claims is', claim);

        if (claim) {
          this.claimForm.patchValue({
            claimId: claim.ClaimId ?? null,
            policyId: claim.PolicyId ?? null,
            ClaimStatusId: claim.ClaimStatusId ?? null,
            assignedUser: claim.AssignedUser ?? '',
            claimType: claim.ClaimType ?? null,
            fullName: claim.FullName ?? '',
            phoneNumber: claim.PhoneNumber ?? '',
            email: claim.Email ?? '',
            submissionDate: claim.SubmissionDate
              ? claim.SubmissionDate.slice(0, 16)
              : null,
            resolutionDate: claim.ResolutionDate
              ? claim.ResolutionDate.slice(0, 16)
              : null,
            claimStatus: claim.ClaimStatusId ?? null,
            createdBy: claim.CreatedBy ?? 'System',
            userId: claim.UserId ?? null,
            CompanyId: claim.CompanyId ?? null,
            empId: claim.empId ?? null,
            productId: claim.ProductId ?? null,
            description: claim.Description ?? '',
            claimAmount: claim.claimAmount ?? '',
            approvedAmount: claim.ApprovedAmount ?? null,
            submissionMethod: claim.SubmissionMethod ?? 'Mobile',
            platform: claim.Platform ?? 'iOS',
            device: claim.Device ?? 'iPhone',
          });

          // Handle claim documents if any
          const docsArray = this.claimForm.get('claimDocuments') as FormArray;
          docsArray.clear(); // Clear existing documents

          if (claim.ClaimDocuments && Array.isArray(claim.ClaimDocuments)) {
            claim.ClaimDocuments.forEach((doc: any) => {
              docsArray.push(
                this.fb.group({
                  docName: [doc.DocName ?? ''],
                  status: [doc.status ?? ''],
                  orderNo: [doc.OrderNo ?? 1],
                  docPath: [doc.DocPath ?? '']
                })
              );
            });
          } else {
            // Ensure at least one document input exists
            docsArray.push(
              this.fb.group({
                docName: [''],
                status: [''],
                orderNo: [1],
                docPath: ['']
              })
            );
          }
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load claim data.';
        console.error(err);
        this.router.navigate(['/claims']);
      },
    });
  }

  clearForm(): void {
    // Reset form and clear uploaded files
    this.claimForm.reset();
    this.uploadedFiles.clear();

    // Clear the FormArray and add one empty document
    while (this.claimDocuments.length !== 0) {
      this.claimDocuments.removeAt(0);
    }
    this.addDocument();

    // Reset specific fields to their default values
    this.claimForm.patchValue({
      submissionDate: new Date().toISOString().slice(0, 16),
      claimStatus: 'Pending',
      createdBy: 'System',
      submissionMethod: 'Mobile',
      platform: 'iOS',
      device: 'iPhone',
      policyId: null,
      ClaimStatusId: null,
      productId: null,
      userId: null,
      claimType: null,
      CompanyId: null,
      empId: null
    });

    // Clear messages
    this.errorMessage = null;
    this.successMessage = null;
  }

  ngOnInit(): void {
    this.loadDropdownData();
    this.route.paramMap.subscribe((params) => {
      const claimId = Number(params.get('claimId')); // Assuming route param is 'hospitalId'
      if (claimId) {
        this.isEditing = true;
        this.loadClaimData(claimId);
      }
    });
  }

  loadDropdownData(): void {
    this.authService.getProducts().subscribe({
      next: (products) => (this.products = products),
      error: (err) => console.error('Error loading products:', err),
    });

    this.authService.getCompanies().subscribe({
      next: (companies) => (this.companies = companies),
      error: (err) => console.error('Error loading companies:', err),
    });

    this.authService.getUsers().subscribe({
      next: (users) => (this.users = users),
      error: (err) => console.error('Error loading users:', err),
    });

    this.authService.getPolicies().subscribe({
      next: (policies) => (this.policies = policies),
      error: (err) => console.error('Error loading policies:', err),
    });

    this.authService.getEmployees().subscribe({
      next: (employees) => (this.employees = employees),
      error: (err) => console.error('Error loading employees:', err),
    });

    this.authService.getClaimStatus().subscribe({
      next: (claimStatuses) => (this.claimStatuses = claimStatuses),
      error: (err) => console.error('Error loading claim status:', err),
    });
  }

  get claimDocuments(): FormArray {
    return this.claimForm.get('claimDocuments') as FormArray;
  }

  addDocument(): void {
    // Instead of trying to get values from non-existent form controls,
    // just create a new empty document entry
    this.claimDocuments.push(
      this.fb.group({
        docName: [''],
        status: [''],
        orderNo: [this.claimDocuments.length + 1],
        docPath: ['']
      })
    );
    
    // No need to reset the form since we're just adding an empty document
  }


  removeDocument(index: number): void {
    // Also remove any associated file
    this.uploadedFiles.delete(index);
    this.claimDocuments.removeAt(index);

    // Re-order the remaining documents
    for (let i = 0; i < this.claimDocuments.length; i++) {
      this.claimDocuments.at(i).get('orderNo')?.setValue(i + 1);
    }
  }



  // onFileSelected(event: any, index: number): void {
  //   const file = event.target.files[0];
  //   if (file) {
  //     // Store the file for later upload
  //     this.uploadedFiles.set(index, file);

  //     // Auto-fill document name if empty
  //     const documentControl = this.claimDocuments.at(index);
  //     if (!documentControl.get('docName')?.value) {
  //       documentControl.get('docName')?.setValue(file.name);
  //     }

  //     // Important: Clear the docPath field here - it will be populated after successful upload
  //     documentControl.get('docPath')?.setValue('');

  //     // Show a preview or indication that file is selected
  //     const fileNameElement = document.getElementById(`file-name-${index}`);
  //     if (fileNameElement) {
  //       fileNameElement.textContent = file.name;
  //       fileNameElement.classList.remove('hidden');
  //     }
  //   }
  // }

  onFileSelected(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFiles.set(index, file);
  
      const documentControl = this.claimDocuments.at(index);
      if (!documentControl.get('docName')?.value) {
        documentControl.get('docName')?.setValue(file.name);
      }
  
      // Preview URL saved only for UI
      if (this.isPreviewable(file.type)) {
        const tempUrl = URL.createObjectURL(file);
        this.previewUrls.set(index, tempUrl); // ✅ use this for preview only
      }
  
      // Don't store temp URL in docPath, avoid duplicate DB insert
      documentControl.get('docPath')?.setValue('');
  
      const fileNameElement = document.getElementById(`file-name-${index}`);
      if (fileNameElement) {
        fileNameElement.textContent = file.name;
        fileNameElement.classList.remove('hidden');
      }
    }
  }
  
  openPreview(index: number): void {
    const url = this.previewUrls.get(index);
    if (url) {
      window.open(url, '_blank');
    }
  }
  
  isPreviewable(fileType: string): boolean {
    const previewableTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'text/plain',
      'text/html'
    ];
    return previewableTypes.includes(fileType);
  }
  previewDocument(docPath: string): void {
    if (!docPath) {
      this.errorMessage = 'No document available to preview';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }

    // Open the document in a new tab
    window.open(docPath, '_blank');
  }
  
  



 
  


  // uploadDocument(file: File, docData: any, claimId: number): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   formData.append('DocName', docData.docName || file.name);
  //   formData.append('ClaimDocId', '0'); // New document, so use 0
  //   formData.append('ClaimId', claimId.toString()); // Use dynamic ClaimId
  //   formData.append('OrderNo', docData.orderNo.toString());
  //   formData.append('DocCreatedBy', 'System');
  //   formData.append('DocIsActive', 'true');

  //   console.log('formdata claimid', formData);

  //   return this.authService.uploadClaimDocument(formData).pipe(
  //     catchError(error => {
  //       console.error('Error uploading document:', error);
  //       return throwError(() => new Error(`Failed to upload ${docData.docName}`));
  //     })
  //   );
  // }
  uploadDocument(file: File, docData: any, claimId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('DocName', docData.docName || file.name);
    formData.append('ClaimDocId', '0'); // New document, so use 0
    formData.append('ClaimId', claimId.toString());
    formData.append('OrderNo', docData.orderNo.toString());
    formData.append('DocCreatedBy', 'System');
    formData.append('DocIsActive', 'true');

    return this.authService.uploadClaimDocument(formData).pipe(
      catchError(error => {
        console.error('Error uploading document:', error);
        return throwError(() => new Error(`Failed to upload ${docData.docName}`));
      })
    );
  }




  // async uploadAllDocuments(claimId: number): Promise<string[]> {
  //   const docPaths: string[] = [];

  //   // Create an array of promises for each upload
  //   const uploadPromises = Array.from(this.uploadedFiles.entries()).map(([index, file]) => {
  //     if (index < this.claimDocuments.length) {
  //       const docData = this.claimDocuments.at(index).value;

  //       return this.uploadDocument(file, docData, claimId)
  //         .toPromise()
  //         .then(response => {
  //           // Extract the docPath from the response
  //           let docPath = '';

  //           // Check if response has the expected structure with docPath/DocFileName
  //           if (response && response.length > 0 && response[0]) {
  //             // Your API returns an array with result objects
  //             docPath = response[0].DocFileName || '';
  //             console.log("docpath iss", docPath)
  //             // Update the form control with the path
  //             this.claimDocuments.at(index).get('docFileName')?.setValue(docPath);
  //           }

  //           return docPath;
  //         })
  //         .catch(error => {
  //           console.error(`Error uploading document at index ${index}:`, error);
  //           throw new Error(`Failed to upload document`);
  //         });
  //     }
  //     return Promise.resolve(''); // Return empty string for any invalid index
  //   });

  //   // Wait for all uploads to complete
  //   if (uploadPromises.length > 0) {
  //     try {
  //       const results = await Promise.all(uploadPromises);
  //       return results.filter(path => path); // Filter out any empty paths
  //     } catch (error) {
  //       console.error('Error during document uploads:', error);
  //       throw error;
  //     }
  //   }

  //   return docPaths;
  // }
  async uploadAllDocuments(claimId: number): Promise<string[]> {
    const docPaths: string[] = [];

    // Create an array of promises for each upload
    const uploadPromises = Array.from(this.uploadedFiles.entries()).map(([index, file]) => {
      if (index < this.claimDocuments.length) {
        const docData = this.claimDocuments.at(index).value;

        return this.uploadDocument(file, docData, claimId)
          .toPromise()
          .then(response => {
            // Extract the docPath from the response
            let docPath = '';

            // Check if response has the expected structure with docPath/DocFileName
            if (response && response.length > 0 && response[0]) {
              // Your API returns an array with result objects
              docPath = response[0].DocFileName || '';
              
              // Update the form control with the path
              this.claimDocuments.at(index).get('docPath')?.setValue(docPath);
            }

            return docPath;
          })
          .catch(error => {
            console.error(`Error uploading document at index ${index}:`, error);
            throw new Error(`Failed to upload document`);
          });
      }
      return Promise.resolve(''); // Return empty string for any invalid index
    });

    // Wait for all uploads to complete
    if (uploadPromises.length > 0) {
      try {
        const results = await Promise.all(uploadPromises);
        return results.filter(path => path); // Filter out any empty paths
      } catch (error) {
        console.error('Error during document uploads:', error);
        throw error;
      }
    }

    return docPaths;
  }



  async onSubmit(): Promise<void> {
    console.log('Claim data is ', this.claimForm.value);
    console.log('isEditing is ', this.isEditing);

    // Validate required fields
    if (!this.claimForm.value.policyId || !this.claimForm.value.claimAmount) {
      console.log('Returned due to missing required fields');
      this.errorMessage = 'Please fill in all required fields (Policy, Claim Amount).';
      setTimeout(() => (this.errorMessage = null), 3000);
      return;
    }

    const documents = this.claimForm.get('claimDocuments')?.value || [];

    const allVerified = documents.every((doc: any) => doc.status === 'Verified');

    if (!allVerified) {
      this.errorMessage = 'All documents must be verified before submitting the claim.';
      this.successMessage = '';
      return;
    }

    try {
      // Create a properly formatted ClaimReqDto object
      const formValues = this.claimForm.value;

      // Filter out documents that don't have a name or path
      const validDocuments = formValues.claimDocuments
        .filter((doc: any) => doc.docName && doc.docPath)
        .map((doc: any) => ({
          DocName: doc.docName,
          OrderNo: doc.orderNo,
          DocPath: doc.docPath,
        }));
      //all done
      const claimData = {
        ClaimId: this.isEditing ? formValues.claimId : 0,
        PolicyId: formValues.policyId,
        ClaimStatusId: this.isEditing ? formValues.ClaimStatusId : 11,
        CompanyId: formValues.CompanyId,
        FullName: formValues.fullName,
        PhoneNumber: formValues.phoneNumber,
        Email: formValues.email,
        SubmissionDate: formValues.submissionDate ? new Date(formValues.submissionDate).toISOString() : null,
        Description: formValues.description,
        ClaimAmount: formValues.claimAmount,
        ProductId: formValues.productId,
        UserId: formValues.userId,
        EmpId: formValues.empId,
        IsActive: true,
        ClaimDocuments: validDocuments,
      };

      let newClaimId: number | null = null;

      // If editing, update the claim
      if (this.isEditing) {
        await this.authService.updateClaim(claimData.ClaimId, claimData).toPromise();
        newClaimId = claimData.ClaimId; // Use existing ClaimId for updates
        console.log('Claim updated successfully!');
        this.successMessage = 'Claim updated successfully!';
        this.errorMessage = null;
      } else {
        // Create a new claim and get the ClaimId from the response
        const response = await this.authService.createClaim(claimData).toPromise();
        console.log('Claim only res:', response);
        const parsedData = JSON.parse(response.responseData);
        console.log('Parsed data:', parsedData.ClaimId);
        newClaimId = parsedData.ClaimId;
        console.log('Claim id new bhindi:', newClaimId);
        console.log('Claim added successfully with ClaimId:', newClaimId);
        this.successMessage = 'Claim added successfully!';
        this.errorMessage = null;
      }

      // Upload documents if there are any, using the newClaimId
      let documentPaths: string[] = [];
      if (this.uploadedFiles.size > 0 && newClaimId) {
        documentPaths = await this.uploadAllDocuments(newClaimId);
        console.log('Uploaded document paths:', documentPaths);
      }

      // Navigate after success
      setTimeout(() => {
        this.router.navigate(['/Claims']);
      }, 1500);
    } catch (error: any) {
      this.errorMessage = 'Failed to process claim: ' + error.message;
      console.error('Error submitting claim:', error);
      setTimeout(() => (this.errorMessage = null), 3000);
    }
  }

  

  nextSection(section: string): void {
    // Allow going back without validation
    const sectionOrder = ['policy', 'user', 'company', 'other', 'documents'];
    const currentIndex = sectionOrder.indexOf(this.currentSection);
    const nextIndex = sectionOrder.indexOf(section);

    // If going backwards, skip validation
    if (nextIndex < currentIndex) {
      this.currentSection = section;
      return;
    }

    let sectionControls: string[] = [];

    // Define controls per section
    switch (this.currentSection) {
      case 'policy':
        sectionControls = ['policyId', 'productId'];
        break;
      case 'user':
        sectionControls = ['userId', 'phoneNumber', 'email'];
        break;
      case 'company':
        sectionControls = ['CompanyId', 'empId'];
        break;
      case 'other':
        sectionControls = ['SubmissionDate', 'createdBy', 'claimAmount', 'ClaimStatusId', 'description'];
        break;
      case 'documents':
        sectionControls = [];
        break;
    }

    let isValid = true;

   
    for (const controlName of sectionControls) {
      const control = this.claimForm.get(controlName);
      if (control) {
        control.markAsTouched();
        if (control.invalid) {
          isValid = false;
        }
      }
    }

    if (isValid) {
      this.currentSection = section;
    }
  }


  


}