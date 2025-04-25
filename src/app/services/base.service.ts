import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, getDoc, serverTimestamp, query, where, getDocs } from '@angular/fire/firestore';

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

    public async updateDocument(collection: string, docId: string, data: any): Promise<void> {
        try {
            const docRef = doc(this.firestore, collection, docId);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    }

    protected async getDocument(collectionName: string, id: string): Promise<any> {
        const docRef = doc(this.firestore, collectionName, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    }

    protected async queryDocuments(collectionName: string, field: string, value: any): Promise<any[]> {
        const q = query(collection(this.firestore, collectionName), where(field, '==', value));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    protected async queryCollection(collection: string, field: string, operator: string, value: any): Promise<any[]> {
        // This would be replaced with actual Firebase implementation
        console.log(`Querying ${collection} where ${field} ${operator} ${value}`);
        return []; // Return empty array for now
    }
}
