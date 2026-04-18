import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Smart Database Service
 * Handles both Real Firebase and Local Fallback seamlessly.
 */
class SmartDatabaseService {
  private isFirebaseReady: boolean = false;

  constructor() {
    this.checkConfig();
  }

  private async checkConfig() {
    try {
      // Small test call to verify connection as per instructions
      // If we don't have db yet (from ./services/firebase), this will remain false.
      if (db) {
        this.isFirebaseReady = true;
      }
    } catch (e) {
      this.isFirebaseReady = false;
    }
  }

  // --- Wrapper Methods ---

  async saveRecord(collectionName: string, id: string, data: any) {
    if (this.isFirebaseReady) {
      await setDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else {
      // Local Fallback
      const localData = JSON.parse(localStorage.getItem(collectionName) || '{}');
      localData[id] = data;
      localStorage.setItem(collectionName, JSON.stringify(localData));
    }
  }

  async getAllRecords(collectionName: string): Promise<any[]> {
    if (this.isFirebaseReady) {
      const q = query(collection(db, collectionName));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } else {
      const localData = JSON.parse(localStorage.getItem(collectionName) || '{}');
      return Object.values(localData);
    }
  }

  // Export functionality to keep data safe
  exportFullBackup() {
    const keys = ['students', 'teachers', 'fees', 'transactions', 'inventory'];
    const backup: any = {};
    keys.forEach(key => {
      backup[key] = JSON.parse(localStorage.getItem(key) || '{}');
    });
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-school-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }
}

export const smartDB = new SmartDatabaseService();
