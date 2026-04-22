import { useState, useEffect } from 'react';

/**
 * Smart Database Service
 * Handles interaction with the Express backend API.
 */
class SmartDatabaseService {
  // --- Wrapper Methods ---

  async saveRecord(collectionName: string, data: any) {
    try {
      const response = await fetch(`/api/${collectionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to save ${collectionName}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error saving to ${collectionName}:`, error);
      // Fallback to local storage if API is down
      const id = data.id || Date.now().toString();
      const localData = JSON.parse(localStorage.getItem(collectionName) || '{}');
      localData[id] = { ...data, id };
      localStorage.setItem(collectionName, JSON.stringify(localData));
      return localData[id];
    }
  }

  async getAllRecords(collectionName: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/${collectionName}`);
      if (!response.ok) throw new Error(`Failed to fetch ${collectionName}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      // Fallback to local storage
      const localData = JSON.parse(localStorage.getItem(collectionName) || '{}');
      return Object.values(localData);
    }
  }

  async deleteRecord(collectionName: string, id: string) {
    try {
      const response = await fetch(`/api/${collectionName}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Failed to delete ${collectionName}`);
      return await response.json();
    } catch (error) {
      console.error(`Error deleting from ${collectionName}:`, error);
      const localData = JSON.parse(localStorage.getItem(collectionName) || '{}');
      delete localData[id];
      localStorage.setItem(collectionName, JSON.stringify(localData));
      return { success: true };
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

/**
 * Custom hook for Dashboard data
 */
export const useDashboard = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [fees, setFees] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [summary, setSummary] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        monthlyIncome: 0,
        pendingFees: 0
    });

    const fetchData = async () => {
        const fetchEndpoint = async (path: string) => {
            try {
                const res = await fetch(path);
                const contentType = res.headers.get("content-type");
                if (!res.ok) {
                    throw new Error(`Server returned ${res.status} for ${path}`);
                }
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await res.text();
                    console.error(`Expected JSON for ${path} but got ${contentType || 'unknown'}. Body starts with: ${text.substring(0, 50)}`);
                    throw new Error(`Endpoint ${path} did not return JSON. It might be serving HTML instead.`);
                }
                return await res.json();
            } catch (err) {
                console.error(`Fetch error for ${path}:`, err);
                return []; // Return empty array on error
            }
        };

        try {
            const [studentsData, teachersData, feesData, transactionsData, inventoryData] = await Promise.all([
                fetchEndpoint('/api/students'),
                fetchEndpoint('/api/teachers'),
                fetchEndpoint('/api/fees'),
                fetchEndpoint('/api/transactions'),
                fetchEndpoint('/api/inventory'),
            ]);

            setStudents(Array.isArray(studentsData) ? studentsData : []);
            setTeachers(Array.isArray(teachersData) ? teachersData : []);
            setFees(Array.isArray(feesData) ? feesData : []);
            setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
            setInventory(Array.isArray(inventoryData) ? inventoryData : []);

            // Calculate summary
            const safeFees = Array.isArray(feesData) ? feesData : [];
            const safeStudents = Array.isArray(studentsData) ? studentsData : [];

            const monthlyIncome = safeFees
                .filter((f: any) => {
                    const payDate = new Date(f.payment_date);
                    const now = new Date();
                    return payDate.getMonth() === now.getMonth() && payDate.getFullYear() === now.getFullYear();
                })
                .reduce((acc: number, current: any) => acc + Number(current.amount), 0);

            const totalMonthlyPotential = safeStudents.reduce((acc: number, curr: any) => acc + (Number(curr.monthly_fee) || 0), 0);
            const pendingFees = totalMonthlyPotential - monthlyIncome;

            setSummary({
                totalStudents: safeStudents.length,
                totalTeachers: (Array.isArray(teachersData) ? teachersData : []).length,
                monthlyIncome,
                pendingFees: pendingFees > 0 ? pendingFees : 0
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { students, teachers, fees, transactions, inventory, summary, refresh: fetchData };
};
