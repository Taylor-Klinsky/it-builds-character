import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  imports: [MatFormFieldModule, MatInputModule],
  selector: 'app-number-input',
  styleUrl: './number-input.scss',
  templateUrl: './number-input.html',
})
export class NumberInput { }
