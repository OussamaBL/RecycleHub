
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CollectionRequest } from '../../models/collection-request.model';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CollectionRequestService {

  private apiUrl = 'http://localhost:3000/';

  constructor(private http: HttpClient) { }

  getUserCollectionRequests(userId: number): Observable<CollectionRequest[]> {
    return this.http.get<CollectionRequest[]>(`${this.apiUrl}collectionRequests?userId=${userId}`);
  }


  getCollectionRequests(): Observable<CollectionRequest[]> {
    return this.http.get<CollectionRequest[]>(`${this.apiUrl}`);
  }

  getCollectionRequestsWithStatusPending(adress:string): Observable<CollectionRequest[]> {
    return this.http.get<CollectionRequest[]>(`${this.apiUrl}collectionRequests?status=pending&collectionAddress=${adress}`);
  }
  addCollectionRequest(request: CollectionRequest): Observable<CollectionRequest> {
    return this.http.post<CollectionRequest>(this.apiUrl+"collectionRequests", request );
  }


  deleteCollectionRequest(id: number|string) {
    return this.http.delete(`${this.apiUrl}collectionRequests/${id}`);
  }


  updateCollectionRequest(id: string | undefined, updatedRequest: { status: string; id?: string; userId: string | number; wasteType: string; photos?: [string, ...string[]]; estimatedWeight: number; collectionAddress: string; desiredDate: string; desiredTimeSlot: string; notes?: string; }) {
    return this.http.put(`${this.apiUrl}collectionRequests/${id}`, updatedRequest);
  }



  addPoints(userId: string | number, pointsEarned: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}points?usersId=${userId}`, { points: pointsEarned });
  }


  getRequestOwner(userId: string|number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}users/${userId}`);
  }
}
