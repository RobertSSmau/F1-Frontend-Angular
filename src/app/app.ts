import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Championships } from './championships/championships';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Championships],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
