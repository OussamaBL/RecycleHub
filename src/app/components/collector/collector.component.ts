import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { CollectionRequest } from '../../models/collection-request.model';
import { CollectionRequestService } from '../../services/collection/collection-request.service';
import { AuthService } from '../../services/auth/auth.service';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-collector',
  standalone:true,
  imports: [CommonModule, NavbarComponent, SidebarComponent],
  templateUrl: './collector.component.html',
  styleUrl: './collector.component.css',
})
export class CollectorComponent {
  statusOptions = ['pending', 'accepted', 'rejected', 'completed'];
  defaultImage = 'https://plus.unsplash.com/premium_photo-1683133531613-6a7db8847c72?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  collectionRequests!: Observable<CollectionRequest[]>;
  openDropdownId: string | null = null;

  constructor(
    private collectionRequestService: CollectionRequestService,
    private authService: AuthService
  ) {
    this.loadCollections();
  }

  calculatePoints(wasteTypes: string, weight: number): number {
    const types = wasteTypes.toLowerCase().split(',').map(type => type.trim());

    let totalPoints = 0;
    const pointsPerKg: { [key in 'plastic' | 'glass' | 'paper' | 'metal']: number } = {
      'plastic': 2,
      'glass': 1,
      'paper': 1,
      'metal': 5
    };

    types.forEach(type => {
      if (pointsPerKg[type as 'plastic' | 'glass' | 'paper' | 'metal']) {
        totalPoints += (pointsPerKg[type as 'plastic' | 'glass' | 'paper' | 'metal'] * weight) / types.length;
      }
    });

    return Math.round(totalPoints);
  }

  loadCollections() {
    this.authService.getCurrentUser().pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return of([]);
        }
        return this.collectionRequestService.getCollectionRequestsWithStatusPending(currentUser.address);
      })
    ).subscribe({
      next: (requests) => {
        this.collectionRequests = of(requests);
      },
      error: (error) => {
        console.error('Error fetching collection requests:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      default: 'bg-gray-100 text-gray-800',
    };
    return statusClasses[status] || statusClasses['default'];
  }

  updateStatus(request: CollectionRequest, newStatus: string, event: Event) {
    event.stopPropagation();
    this.openDropdownId = null;

    const confirmMessage = newStatus === 'completed' || newStatus === 'accepted'
      ? `This will award points to the requesting user. Are you sure you want to change the status to ${newStatus}?`
      : `Are you sure you want to change the status to ${newStatus}?`;

    Swal.fire({
      title: 'Are you sure?',
      text: confirmMessage,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedRequest = { ...request, status: newStatus };

        // First update the request status
        this.collectionRequestService
          .updateCollectionRequest(request.id!, updatedRequest)
          .subscribe({
            next: () => {
              // If status is completed or accepted, update user points
              if (newStatus === 'completed' || newStatus === 'accepted') {
                const earnedPoints = this.calculatePoints(request.wasteType, request.estimatedWeight);


                this.collectionRequestService.getRequestOwner(request.userId).subscribe({
                  next: (requestOwner) => {
                    if (requestOwner) {
                      const updatedUser = {
                        ...requestOwner,
                        points: (requestOwner.points || 0) + earnedPoints
                      };


                      this.authService.updateUserAfterCalcul(updatedUser).subscribe({
                        next: () => {
                          Swal.fire({
                            title: 'Success!',
                            text: `Request status updated to ${newStatus}. User earned ${earnedPoints} points!`,
                            icon: 'success',
                          });
                          this.loadCollections();
                        },
                        error: (error) => {
                          console.error('Error updating user points:', error);
                          this.handleError();
                        }
                      });
                    }
                  },
                  error: (error) => {
                    console.error('Error fetching request owner:', error);
                    this.handleError();
                  }
                });
              } else {
                Swal.fire({
                  title: 'Success!',
                  text: `Request status updated to ${newStatus}`,
                  icon: 'success',
                });
                this.loadCollections();
              }
            },
            error: (error) => {
              console.error('Error updating status:', error);
              this.handleError();
            }
          });
      }
    });
  }

  private handleError() {
    Swal.fire({
      title: 'Error',
      text: 'Failed to update status. Please try again.',
      icon: 'error',
    });
  }

  toggleDropdown(requestId: string, event: Event) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === requestId ? null : requestId;
  }
}
