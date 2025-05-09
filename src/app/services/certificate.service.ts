import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { from, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CertificateService {
  private readonly RESULTS_COLLECTION = 'final_results';

  constructor(
    private firestore: Firestore,
    private functions: Functions
  ) { }

  getCertificateUrl(userId: string, challengeId: string): Observable<string | null> {
    const docRef = doc(this.firestore, this.RESULTS_COLLECTION, `${userId}_${challengeId}`);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? doc.data()?.['certificateImageUrl'] || null : null)
    );
  }

  generateCertificate(userId: string, challengeId: string, dalleParams: any): Observable<string> {
    const callable = httpsCallable(this.functions, 'generateCertificate');
    return from(callable(dalleParams)).pipe(
      switchMap((result: any) => {
        const imageUrl = result?.data?.imageUrl;
        if (!imageUrl) throw new Error('No imageUrl returned');
        // Store in final_results
        const docRef = doc(this.firestore, this.RESULTS_COLLECTION, `${userId}_${challengeId}`);
        return from(setDoc(docRef, { certificateImageUrl: imageUrl }, { merge: true }))
          .pipe(map(() => imageUrl));
      })
    );
  }
}
