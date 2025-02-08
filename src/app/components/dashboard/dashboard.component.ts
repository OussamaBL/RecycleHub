import { Component } from '@angular/core';
import { NavbarComponent } from "../../layout/navbar/navbar.component";
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone:true,
  imports: [NavbarComponent, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
