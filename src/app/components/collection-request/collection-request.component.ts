import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl, Validators, FormArray, ReactiveFormsModule} from '@angular/forms';
import { CollectionRequest } from '../../models/collection-request.model';
import { CollectionRequestService } from '../../services/collection/collection-request.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { NavbarComponent } from '../../layout/navbar/navbar.component';

@Component({
  selector: 'app-collection-request',
  templateUrl: './collection-request.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    NavbarComponent,
  ],
})
export class CollectionRequestComponent implements OnInit {
  collectionForm!: FormGroup;
  errorMessage: string = '';
  maxRequests: number = 3;
  maxTotalWeight: number = 10000;
  hasReachedMaxRequests!: boolean;

  constructor(
    private collectionService: CollectionRequestService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.wasteTypes.length === 0) {
      this.addWasteType();
    }
  }

  private initializeForm(): void {
    this.collectionForm = new FormGroup({
      wasteTypes: new FormArray(
        [],
        [Validators.required, this.validateWasteTypes.bind(this)]
      ),
      photos: new FormArray([]),
      estimatedWeight: new FormControl('', [Validators.required, Validators.max(this.maxTotalWeight),
      ]),
      collectionAddress: new FormControl('', [Validators.required]),
      desiredDate: new FormControl('', [Validators.required]),
      desiredTimeSlot: new FormControl('', [Validators.required, this.validateTimeSlot.bind(this),]),
      notes: new FormControl(''),
    });
  }

  get wasteTypes(): FormArray {
    return this.collectionForm.get('wasteTypes') as FormArray;
  }

  get photos(): FormArray {
    return this.collectionForm.get('photos') as FormArray;
  }

  createWasteTypeControl(): FormControl {
    return new FormControl('', [Validators.required]);
  }

  addWasteType(): void {
    if (this.wasteTypes.length < 4) {
      this.wasteTypes.push(this.createWasteTypeControl());
    }
    }

  removeWasteType(index: number): void {
    this.wasteTypes.removeAt(index);
  }

  createPhotoControl(): FormControl {
    return new FormControl('');
  }

  addPhoto(): void {
    this.photos.push(this.createPhotoControl());
  }

  removePhoto(index: number): void {
    this.photos.removeAt(index);
  }

  validateWasteTypes(formArray: FormArray): { [key: string]: boolean } | null {
    const validTypes = ['plastic', 'glass', 'paper', 'metal'];

    if (formArray.length > 4) {
      return { tooManyWasteTypes: true };
    }

    return formArray.controls.every((control) =>
      validTypes.includes(control.value)
    )
      ? null
      : { invalidWasteType: true };
  }

  validateTimeSlot(control: FormControl): { [key: string]: boolean } | null {
    const timePattern =
      /^(09:00|10:00|11:00|12:00|13:00|14:00|15:00|16:00|17:00|18:00)-(09:00|10:00|11:00|12:00|13:00|14:00|15:00|16:00|17:00|18:00)$/;
    return timePattern.test(control.value) ? null : { invalidTimeSlot: true };
  }

  private async checkPendingRequests(): Promise<void> {
    try {
      const currentUserId = Number(
        (await firstValueFrom(this.authService.getCurrentUser()))?.id ?? 0
      );
      const requests = await firstValueFrom(
        this.collectionService.getCollectionRequests()
      );

      const pendingRequests = requests.filter(
        (request: CollectionRequest) =>
          request.userId == currentUserId && request.status === 'pending'
      );

      this.hasReachedMaxRequests = pendingRequests.length >= this.maxRequests;

      if (this.hasReachedMaxRequests) {
        this.errorMessage =
          'You have reached the maximum limit of 3 pending requests.';
        this.collectionForm.disable();
      }
    } catch (error) {
      console.error('Error checking pending requests:', error);
      this.errorMessage =
        'Error checking pending requests. Please try again later.';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.collectionForm.invalid) {
      this.errorMessage = 'Please correct the errors in the form.';
      return;
    }

    try {
      const currentUser = await firstValueFrom(
        this.authService.getCurrentUser()
      );

      if (!currentUser || !currentUser.id) {
        Swal.fire({
          title: 'Error',
          text: 'You must be logged in to submit a collection request',
          icon: 'error',
        });
        this.router.navigate(['/login']);
        return;
      }

      const requests = await firstValueFrom(
        this.collectionService.getCollectionRequests()
      );
      const pendingRequests = requests.filter(
        (request: CollectionRequest) =>
          request.userId === currentUser.id && request.status === 'pending'
      );

      if (pendingRequests.length >= this.maxRequests) {
        Swal.fire({
          title: 'Error',
          text: 'You have reached the maximum limit of 3 pending requests.',
          icon: 'error',
        });
        return;
      }

      const request: CollectionRequest = {
        userId: currentUser.id,
        wasteType: this.wasteTypes.value.join(', '),
        photos: this.photos.value.filter((photo: string) => photo),
        estimatedWeight: this.collectionForm.value.estimatedWeight,
        collectionAddress: this.collectionForm.value.collectionAddress,
        desiredDate: this.collectionForm.value.desiredDate,
        desiredTimeSlot: this.collectionForm.value.desiredTimeSlot,
        notes: this.collectionForm.value.notes,
        status: 'pending',
      };

      this.collectionService.addCollectionRequest(request).subscribe({
        next: () => {
          Swal.fire({
            title: 'Success!',
            text: 'Collection request submitted successfully!',
            icon: 'success',
          });
          this.collectionForm.reset();
        },
        error: (error) => {
          this.errorMessage = 'Submission failed. Please try again.';
          console.error('Collection Request error', error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to submit collection request. Please try again.',
            icon: 'error',
          });
        },
      });
    } catch (error) {
      console.error('Error submitting collection request:', error);
      Swal.fire({
        title: 'Error',
        text: 'An unexpected error occurred. Please try again.',
        icon: 'error',
      });
    }
  }
}
