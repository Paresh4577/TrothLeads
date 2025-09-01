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
  name: any;
  comapnyname: any;
  currentSection: string = 'policy';
  policyDetails: any = null;
  filePreviewUrls: { [key: number]: string } = {};
  previewUrls: Map<number, string> = new Map();
  id = 0;
  users: any[] = [];
  claimStatuses: any[] = [];
  isEditing: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  uploadedFiles: Map<number, File> = new Map();
  documentOptions: string[] = ['Aadhaar Card', 'PAN Card', 'Driving License', 'RC Book'];

  constructor(
    private fb: FormBuilder,
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.claimForm = this.fb.group({
      claimId: [null],
      policyId: [null, Validators.required],
      policyNumberInput: ['', Validators.required], // New control for policy number input
      ClaimStatusId: [this.isEditing ? null : 11, Validators.required],
      submissionDate: [this.getTodayDate(), Validators.required],
      description: ['', Validators.required],
      claimAmount: ['', [Validators.required, Validators.min(0)]],
      userId:[null,Validators.required],
      // Add policy details fields to the form
      policyNo:[''],
      customerNo:[''],
      customerFullName: [''],
      customerMobile: [''],
      customerEmail: [''],
      productName: [''],
      insuranceCompanyName: [''],
      claimDocuments: this.fb.array([
        this.fb.group({
          docName: [''],
          status: [''],
          orderNo: [1],
          docPath: ['']
        }),
      ]),
    });
  }

  get claimDocuments(): FormArray {
    return this.claimForm.get('claimDocuments') as FormArray;
  }

  getTodayDate(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  }

  BackToClaimList(): void {
    this.router.navigate(['/Claims']);
  }

  loadUsers(): void {
    console.log("method called users")
    this.errorMessage = '';

    this.authService.getUsers().subscribe({
      next: (users) => {
        console.log("Users",users)
        this.users = users;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load users. Please try again later.';
        console.error('Error loading users:', err);
      },
    });
  }

  fetchPolicyDetails(): void {
    const policyNo = this.claimForm.get('policyNumberInput')?.value;
    if (!policyNo) {
      this.errorMessage = 'Please enter a valid policy number.';
      setTimeout(() => (this.errorMessage = null), 3000);
      return;
    }
    console.log("policy namabar chhe ",policyNo)
    this.authService.getPolicyByNumber(policyNo).subscribe({
      next: (policy) => {
        console.log("policy is ",policy)
        if (policy) {
          console.log("Cus Name", policy.CustomerFullName)
          this.policyDetails = {
            CustomerNo:policy.CustomerNo,
            CustomerFullName: policy.CustomerFullName || '',
            CustomerMobile: policy.CustomerMobile || '',
            CustomerEmail: policy.CustomerEmail || '',
            ProductName: policy.ProductName || '',
            InsuranceCompanyName: policy.InsuranceCompanyName || ''
          };
          
          // Update form with policy details
          this.claimForm.patchValue({
            policyId: policy.PolicyNo,
            policyNo: policy.PolicyNo,
            customerNo:policy.CustomerNo,
            customerFullName: policy.CustomerFullName || '',
            customerMobile: policy.CustomerMobile || '',
            customerEmail: policy.CustomerEmail || '',
            productName: policy.ProductName || '',
            insuranceCompanyName: policy.InsuranceCompanyName || ''
          });
          
          this.errorMessage = null;
        } else {
          this.errorMessage = 'Policy not found.';
          this.policyDetails = null;
          this.claimForm.patchValue({
            policyId: null,
            customerNo:'',
            customerFullName: '',
            customerMobile: '',
            customerEmail: '',
            productName: '',
            insuranceCompanyName: ''
          });
          setTimeout(() => (this.errorMessage = null), 3000);
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to fetch policy details.';
        this.policyDetails = null;
        this.claimForm.patchValue({
          policyId: null,
          customerNo:'',
          customerFullName: '',
          customerMobile: '',
          customerEmail: '',
          productName: '',
          insuranceCompanyName: ''
        });
        setTimeout(() => (this.errorMessage = null), 3000);
        console.error(err);
      }
    });
  }

  loadClaimData(claimId: number): void {
    this.authService.getClaimById(claimId).subscribe({
      next: (claim) => {
        if (claim) {
          this.claimForm.patchValue({
            claimId: claim.ClaimId ?? null,
            policyId: claim.PolicyId ?? null,
            policyNumberInput: claim.PolicyNo ?? '',
            ClaimStatusId: claim.ClaimStatusId ?? null,
            submissionDate: claim.SubmissionDate
              ? claim.SubmissionDate.slice(0, 16)
              : null,
            description: claim.Description ?? '',
            claimAmount: claim.ClaimAmount ?? '',
            // Load existing policy details if available
            customerNo:claim.CustomerNo ?? '',
            customerFullName: claim.CustomerFullName ?? '',
            customerMobile: claim.CustomerMobile ?? '',
            customerEmail: claim.CustomerEmail ?? '',
            productName: claim.ProductName ?? '',
            insuranceCompanyName: claim.InsuranceCompanyName ?? ''
          });

          // Fetch policy details for editing
          if (claim.PolicyNo) {
            this.fetchPolicyDetails();
          }

          // Handle claim documents
          const docsArray = this.claimForm.get('claimDocuments') as FormArray;
          docsArray.clear();
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
      }
    });
  }

  clearForm(): void {
    this.claimForm.reset();
    this.uploadedFiles.clear();
    this.policyDetails = null;
    while (this.claimDocuments.length !== 0) {
      this.claimDocuments.removeAt(0);
    }
    this.addDocument();
    this.claimForm.patchValue({
      submissionDate: this.getTodayDate(),
      ClaimStatusId: 11
    });
    this.errorMessage = null;
    this.successMessage = null;
  }

  ngOnInit(): void {
    this.loadDropdownData();
    
    this.route.paramMap.subscribe((params) => {
       console.log("Raw EmpId param:", params.get('claimId'));
      const claimId = Number(params.get('claimId'));
      const empId = Number(params.get('claimId'));
      console.log("ng",empId)
      if (empId) {
        
        
      this.fetchEmployeeAndCompanyDetails(empId);
    }
      if (claimId) {
        this.isEditing = true;
        this.loadClaimData(claimId);
       
      }
      this.loadUsers();
    });
  }
  //////////////////

  fetchEmployeeAndCompanyDetails(empId: number): void {
console.log("fetchEmp is ",empId)
  this.authService.getAdminById(empId).subscribe({
    next: (employee) => {
      if (employee) {
        console.log("Employee Details:", employee);

        const { PolicyNo, SumInsured, Name, CompanyId } = employee;
       console.log("AName is ",Name)
        // Patch basic employee policy details into form
        this.claimForm.patchValue({
          policyNumberInput: PolicyNo,
          claimAmount: SumInsured,
          customerFullName: Name,
        });
        this.name = Name;

        console.log("this name is ",this.name)
       
       
        // Fetch company name using CompanyId
        if (CompanyId) {
          this.authService.getCompanyById(CompanyId).subscribe({
            next: (company) => {
              if (company) {
                console.log("Company Details:", company);
                this.comapnyname = company.CompanyName;
                this.claimForm.patchValue({
                  insuranceCompanyName: company.CompanyName
                });
              }
            },
            error: (err) => {
              console.error('Error fetching company details:', err);
            }
          });
        }
        
        else {
          console.warn('CompanyId not found in employee details');
        }
      } else {
        console.warn('Employee not found for EmpId:', empId);
      }
      this.fetchPolicyDetails()
    },
    error: (err) => {
      console.error('Error fetching employee details:', err);
    }
  });
  }
  /////////////////////


  loadDropdownData(): void {
    this.authService.getClaimStatus().subscribe({
      next: (claimStatuses) => (this.claimStatuses = claimStatuses),
      error: (err) => console.error('Error loading claim status:', err),
    });
  }

  addDocument(): void {
    this.claimDocuments.push(
      this.fb.group({
        docName: [''],
        status: [''],
        orderNo: [this.claimDocuments.length + 1],
        docPath: ['']
      })
    );
  }

  removeDocument(index: number): void {
    this.uploadedFiles.delete(index);
    this.claimDocuments.removeAt(index);
    for (let i = 0; i < this.claimDocuments.length; i++) {
      this.claimDocuments.at(i).get('orderNo')?.setValue(i + 1);
    }
  }

  onFileSelected(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFiles.set(index, file);
      const documentControl = this.claimDocuments.at(index);
      if (!documentControl.get('docName')?.value) {
        documentControl.get('docName')?.setValue(file.name);
      }
      if (this.isPreviewable(file.type)) {
        const tempUrl = URL.createObjectURL(file);
        this.previewUrls.set(index, tempUrl);
      }
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

  uploadDocument(file: File, docData: any, claimId: number): Observable<any> {
   const formData = new FormData();
    formData.append('file', file);
    formData.append('DocName', docData.docName || file.name);
    formData.append('ClaimDocId', '0'); // New document, so use 0
    formData.append('ClaimId', claimId.toString()); // Use dynamic ClaimId
    formData.append('OrderNo', docData.orderNo.toString());
    formData.append('DocCreatedBy', 'System');
    formData.append('DocIsActive', 'true');

    console.log('formdata claimid', formData);


    return this.authService.uploadClaimDocument(formData).pipe(
      catchError(error => {
        console.error('Error uploading document:', error);
        return throwError(() => new Error(`Failed to upload ${docData.docName}`));
      })
    );
  }

  async uploadAllDocuments(claimId: number): Promise<string[]> {
    const docPaths: string[] = [];
    const uploadPromises = Array.from(this.uploadedFiles.entries()).map(([index, file]) => {
      if (index < this.claimDocuments.length) {
        const docData = this.claimDocuments.at(index).value;
        return this.uploadDocument(file, docData, claimId)
          .toPromise()
          .then(response => {
            let docPath = '';
            if (response && response.length > 0 && response[0]) {
              docPath = response[0].DocFileName || '';
              this.claimDocuments.at(index).get('docPath')?.setValue(docPath);
            }
            return docPath;
          })
          .catch(error => {
            console.error(`Error uploading document at index ${index}:`, error);
            throw new Error(`Failed to upload document`);
          });
      }
      return Promise.resolve('');
    });

    if (uploadPromises.length > 0) {
      try {
        const results = await Promise.all(uploadPromises);
        return results.filter(path => path);
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

    if (!this.claimForm.value.policyId || !this.claimForm.value.claimAmount) {
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
      const formValues = this.claimForm.value;
      const validDocuments = formValues.claimDocuments
        .filter((doc: any) => doc.docName && doc.docPath)
        .map((doc: any) => ({
          ClaimId:400,
          DocName: doc.docName,
          OrderNo: doc.orderNo,
          DocPath: doc.docPath,
        }));

      const claimData = {
        ClaimId: this.isEditing ? formValues.ClaimId : 0,
        PolicyId: 1,
        ClaimStatusId: this.isEditing ? formValues.ClaimStatusId : 11,
        SubmissionDate: formValues.submissionDate ? new Date(formValues.submissionDate).toISOString() : null,
        Description: formValues.description,
        ClaimAmount: formValues.claimAmount,
        userid:formValues.userId,
        // Include policy details in claim data
        PolicyNo:formValues.policyNo,
        CustomerNo:formValues.customerNo,
        CustomerFullName: formValues.customerFullName,
        CustomerMobile: formValues.customerMobile,
        CustomerEmail: formValues.customerEmail,
        ProductName: formValues.productName,
        InsuranceCompanyName: formValues.insuranceCompanyName,
        ClaimDocuments: validDocuments,
      };

      let newClaimId: number | null = null;

      if (this.isEditing) {
        await this.authService.updateClaim(claimData.ClaimId, claimData).toPromise();
        newClaimId = claimData.ClaimId;
       
        this.successMessage = 'Claim updated successfully!';
        this.errorMessage = null;
      } else {
         const response = await this.authService.createClaim(claimData).toPromise();
        console.log('Claim only res:', response);
        const parsedData = JSON.parse(response.responseData);
        console.log('Parsed data:', parsedData);
        newClaimId =  parsedData[0].ClaimId;
        console.log('Claim id new bhindi:', newClaimId);
        console.log('Claim added successfully with ClaimId:', newClaimId);
        this.successMessage = 'Claim added successfully!';
        this.errorMessage = null;
      }

      let documentPaths: string[] = [];
      if (this.uploadedFiles.size > 0 && newClaimId) {
        documentPaths = await this.uploadAllDocuments(newClaimId);
        console.log('Uploaded document paths:', documentPaths);
      }

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
    console.log("Next is called")
    const sectionOrder = ['policy', 'other', 'documents'];
    const currentIndex = sectionOrder.indexOf(this.currentSection);
    const nextIndex = sectionOrder.indexOf(section);

    if (nextIndex < currentIndex) {
      this.currentSection = section;
      return;
    }

    let sectionControls: string[] = [];
    
    switch (this.currentSection) {
      
      case 'policy':
        sectionControls = ['policyId', 'policyNumberInput'];
        break;
      case 'other':
        sectionControls = ['submissionDate', 'claimAmount', 'ClaimStatusId', 'description'];
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