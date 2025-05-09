import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { from, Observable, forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { UserService } from './user.service';
import { ChallengeService } from './challenge.service';

@Injectable({ providedIn: 'root' })
export class CertificateService {
  private readonly RESULTS_COLLECTION = 'final_results';

  constructor(
    private firestore: Firestore,
    private functions: Functions,
    private userService: UserService,
    private challengeService: ChallengeService
  ) { }

  getCertificateUrl(userId: string, challengeId: string): Observable<string | null> {
    const docRef = doc(this.firestore, this.RESULTS_COLLECTION, `${userId}_${challengeId}`);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? doc.data()?.['certificateImageUrl'] || null : null)
    );
  }

  private async generatePrompt(userId: string, challengeId: string): Promise<string> {
    // Fetch user and challenge data
    const [user, challenge] = await Promise.all([
      this.userService.getUser(userId),
      this.challengeService.getChallenge(challengeId)
    ]);

    if (!user || !challenge) {
      throw new Error('User or challenge data not found');
    }

    // Get user's name or use a default
    const userName = user.name || 'User';

    // Get challenge focus area and description
    const focusArea = challenge.focus?.focusArea || 'the challenge';
    const description = challenge.focus?.description || '';

    // Calculate overall score if available
    const rounds = challenge.rounds || [];
    const totalScore = rounds.reduce((sum, round) => sum + (round.evaluation?.score || 0), 0);
    const averageScore = rounds.length > 0 ? (totalScore / rounds.length).toFixed(2) : '0';

    // Create a detailed prompt for DALL-E
    return `Create a professional certificate of achievement with the following details:
    - Recipient: ${userName}
    - Achievement: Successfully completed ${focusArea} challenge
    - Description: ${description}
    - Performance: Achieved an average score of ${averageScore}
    - Style: Modern, professional design with elegant typography
    - Include: Achievement title, recipient name, completion date, and a decorative border
    - Colors: Use a professional color scheme with gold/silver accents
    - Format: Landscape orientation with space for signature
    Make it visually appealing and suitable for sharing on social media.`;
  }

  generateCertificate(userId: string, challengeId: string): Observable<string> {
    return from(this.generatePrompt(userId, challengeId)).pipe(
      switchMap(prompt => {
        const dalleParams = {
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          response_format: 'url'
        };

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
      })
    );
  }
}
