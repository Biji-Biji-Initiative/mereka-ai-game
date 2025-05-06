import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';

declare var google: any;

@Injectable({
    providedIn: 'root'
})
export class GoogleMapsService {
    private autocompleteService: any;
    private placesService: any;

    constructor() {
        this.initAutocompleteService();
    }

    private initAutocompleteService() {
        if (typeof google !== 'undefined' && google.maps) {
            this.autocompleteService = new google.maps.places.AutocompleteService();
            this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
        }
    }

    getPlacePredictions(input: string): Observable<any[]> {
        if (!this.autocompleteService) {
            return of([]);
        }

        return from(
            new Promise<any[]>((resolve, reject) => {
                this.autocompleteService.getPlacePredictions(
                    { input },
                    (predictions: any[], status: string) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            resolve(predictions);
                        } else {
                            resolve([]);
                        }
                    }
                );
            })
        );
    }

    getPlaceDetails(placeId: string): Observable<any> {
        if (!this.placesService) {
            return of(null);
        }

        return from(
            new Promise((resolve, reject) => {
                this.placesService.getDetails(
                    { placeId },
                    (place: any, status: string) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            resolve(place);
                        } else {
                            resolve(null);
                        }
                    }
                );
            })
        );
    }
}
