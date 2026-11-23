import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  imports: [MatFormFieldModule, MatInputModule],
  selector: 'app-text-input',
  styleUrl: './text-input.scss',
  templateUrl: './text-input.html',
})
export class TextInput { }
