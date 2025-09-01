import { Component, OnInit } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  paginatedUsers: any[] = [];
  currentUser: any = {
    UserId: null,
    UserName: '',
    FullName: '',
    EmailAddress: '',
    Password: '',
    RememberMe: false,
  };

  isLoading = true;
  errorMessage = '';
  showForm = false;
  searchFullName: string = '';
  isEditing = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  itemsPerPageOptions: number[] = [5, 10, 25, 50];

  searchUserName: string = '';
  noRecord: string = '';

  constructor(
    private authService: authService,
    private router: Router,
    private messageservice: MessageService
  ) {}

  ngOnInit(): void {
    this.noRecord = this.messageservice.getNoRecordMessage();
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.totalItems = this.users.length;
        this.generateItemsPerPageOptions(this.totalItems);
        this.isLoading = false;
        this.searchUsers();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load users. Please try again later.';
        this.isLoading = false;
        console.error('Error loading users:', err);
      },
    });
  }

  viewUser(userId: number): void {
    this.router.navigate(['/viewUser', userId]);
  }
  

  generateItemsPerPageOptions(total: number): void {
  const baseOptions = [10, 25, 50, 100, 200, 500];
  this.itemsPerPageOptions = baseOptions.filter(opt => opt <= total);

  // Optionally, always include total if not already in list
  if (!this.itemsPerPageOptions.includes(total)) {
    this.itemsPerPageOptions.push(total);
  }

  // Sort options
  this.itemsPerPageOptions.sort((a, b) => a - b);
}

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.currentPage = 1; // Reset to first page
    this.searchUsers();
  }

  searchUsers(): void {
    let filteredUsers = [...this.users];

    if (this.searchUserName.trim()) {
      filteredUsers = filteredUsers.filter((user) =>
        user.UserName?.toLowerCase().includes(this.searchUserName.toLowerCase())
      );
    }

    this.totalItems = filteredUsers.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  }

  showAddForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentUser = {
      UserId: null,
      UserName: '',
      EmailAddress: '',
      RememberMe: false,
    };
  }

  editUser(userId: number): void {
    const user = this.users.find((u) => u.UserId === userId);
    if (user) {
      this.currentUser = { ...user };
      this.showForm = true;
      this.isEditing = true;
    }
  }

  submitUser(): void {
    if (this.isEditing) {
      this.authService
        .updateUser(this.currentUser.UserId, this.currentUser)
        .subscribe({
          next: () => {
            this.loadUsers();
            this.showForm = false;
          },
          error: (err) => this.handleError('Failed to update user', err),
        });
    } else {
      this.authService.createUser(this.currentUser).subscribe({
        next: () => {
          this.loadUsers();
          this.showForm = false;
        },
        error: (err) => this.handleError('Failed to create user', err),
      });
    }
  }
   
  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 3000);
  }
}
