// search-bar.component.ts
import { Component, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBarComponent  {
  placeholder = input<string>('Search...');
  debounceTimeMs = input<number>(300);
  searchChange = output<string>();
  searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(this.debounceTimeMs()),
      distinctUntilChanged(),
      takeUntilDestroyed() 
    ).subscribe(value => {
      this.searchChange.emit(value);
    });
}}
