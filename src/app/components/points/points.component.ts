import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NavbarComponent } from "../../layout/navbar/navbar.component";
import { SidebarComponent } from "../../layout/sidebar/sidebar.component";

export interface RetraitOption {
  points: number;
  voucher: number;
  discount: string;
}

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.css'],
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent]
})
export class PointsComponent implements OnInit {
  currentPoints: number = 0;

  retraitOptions: RetraitOption[] = [
    { points: 100, voucher: 50, discount: 'Basic Voucher' },
    { points: 200, voucher: 120, discount: 'Standard Voucher' },
    { points: 500, voucher: 350, discount: 'Premium Voucher' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserPoints();
  }

  private loadUserPoints(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (!user) {
          this.router.navigate(['/login']);
          return;
        }
        this.currentPoints = user.points || 0;
      },
      error: (error) => {
        console.error('Error fetching user points:', error);
        Swal.fire({
          title: 'Error',
          text: 'Could not fetch your points. Please try again.',
          icon: 'error'
        });
      }
    });
  }

  retraitPoints(option: RetraitOption): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (!user) {
          this.router.navigate(['/login']);
          return;
        }


        if (user.points < option.points) {
          Swal.fire({
            title: 'Insufficient Points',
            text: `You need at least ${option.points} points to redeem this voucher.`,
            icon: 'warning'
          });
          return;
        }


        Swal.fire({
          title: 'Confirm Points Retrieval',
          html: `Convert ${option.points} points for a ${option.voucher} Dh voucher?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Confirm',
          color: 'success',
          confirmButtonColor: '#28a745',
          cancelButtonColor: 'red',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            const updatedUser = {
              ...user,
              points: user.points - option.points
            };

            this.authService.updateUser(updatedUser).subscribe({
              next: (response) => {
                Swal.fire({
                  title: 'Points Retrieved!',
                  html: `
                    You've received a ${option.voucher} Dh voucher.<br>
                    Remaining points: ${updatedUser.points}
                  `,
                  icon: 'success'
                });

                // Update local storage and refresh points
                this.authService.storeUserInfo(response);
                this.currentPoints = updatedUser.points;
              },
              error: (error) => {
                Swal.fire({
                  title: 'Error',
                  text: 'Failed to retrieve points. Please try again.',
                  icon: 'error'
                });
              }
            });
          }
        });
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        Swal.fire({
          title: 'Error',
          text: 'Could not process your request.',
          icon: 'error'
        });
      }
    });
  }
}
