import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, getDoc, serverTimestamp } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class BaseService {
    constructor(protected firestore: Firestore) { }

    protected async createDocument(collectionName: string, data: any): Promise<string> {
        const docRef = doc(collection(this.firestore, collectionName));
        const id = docRef.id;

        await setDoc(docRef, {
            ...data,
            id,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return id;
    }

    protected async updateDocument(collectionName: string, id: string, data: any): Promise<void> {
        const docRef = doc(this.firestore, collectionName, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    }

    protected async getDocument(collectionName: string, id: string): Promise<any> {
        const docRef = doc(this.firestore, collectionName, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    }
}
