import { Component } from '@angular/core';

@Component({
  selector: 'app-scoping',
  templateUrl: './scoping.component.html',
  styleUrls: ['./scoping.component.scss'],
  standalone: false
})
export class ScopingComponent {
  activeTab: 'add' | 'details' | 'fund' = 'details';

  setActiveTab(tab: 'add' | 'details' | 'fund'): void {
    this.activeTab = tab;
  }
}
