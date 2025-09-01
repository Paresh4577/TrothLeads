import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  @Input() itemsPerPage: number = 10;
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPageOptions: number[] = [5, 10, 25, 50];
  @Input() currentPageItems: number = 0;

  @Output() itemsPerPageChange = new EventEmitter<number>();

  onItemsPerPageChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value);
    this.itemsPerPageChange.emit(value);
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + this.currentPageItems;
  }
}
