import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TextInput } from '../components/inputs/text-input/text-input';
import { NumberInput } from '../components/inputs/number-input/number-input';

@Component({
  imports: [RouterOutlet, TextInput, NumberInput],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('it-builds-character');
}
