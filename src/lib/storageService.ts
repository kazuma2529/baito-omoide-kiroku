import { db, hasValidConfig } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { JobRecord } from '../types';
import { INITIAL_MOCK_RECORDS } from './mockData';

const LOCAL_STORAGE_KEY_PREFIX = 'part_time_memory_records_';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  console.error(`Firestore Error [${operationType}] at ${path}:`, errMessage);
}

/**
 * Get all job records for a given user
 */
export async function getJobRecords(userId: string): Promise<JobRecord[]> {
  if (hasValidConfig && db) {
    const path = 'jobRecords';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const records: JobRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        records.push({
          id: docSnap.id,
          userId: data.userId,
          title: data.title || '',
          workplace: data.workplace || '',
          workDateType: data.workDateType || 'single',
          startDate: data.startDate || '',
          endDate: data.endDate || null,
          selectedDates: Array.isArray(data.selectedDates) ? data.selectedDates : [],
          isCurrentlyWorking: Boolean(data.isCurrentlyWorking),
          tags: Array.isArray(data.tags) ? data.tags : [],
          jobDescription: data.jobDescription || '',
          impression: data.impression || '',
          recommendationRating: typeof data.recommendationRating === 'number' ? data.recommendationRating : null,
          enjoymentRating: typeof data.enjoymentRating === 'number' ? data.enjoymentRating : null,
          busynessRating: typeof data.busynessRating === 'number' ? data.busynessRating : null,
          workabilityRating: typeof data.workabilityRating === 'number' ? data.workabilityRating : null,
          photoUrls: Array.isArray(data.photoUrls) ? data.photoUrls : [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });

      // Sort by startDate or createdAt descending (newest first)
      return records.sort((a, b) => {
        const dateA = a.startDate || a.createdAt;
        const dateB = b.startDate || b.createdAt;
        return dateB.localeCompare(dateA);
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      // Fallback to local storage if Firestore error occurs
    }
  }

  // Local Storage Fallback
  const key = `${LOCAL_STORAGE_KEY_PREFIX}${userId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    // If first time for demo user, seed mock data
    if (userId === 'demo-user-id') {
      localStorage.setItem(key, JSON.stringify(INITIAL_MOCK_RECORDS));
      return INITIAL_MOCK_RECORDS;
    }
    return [];
  }

  try {
    const parsed: JobRecord[] = JSON.parse(stored);
    return parsed.sort((a, b) => {
      const dateA = a.startDate || a.createdAt;
      const dateB = b.startDate || b.createdAt;
      return dateB.localeCompare(dateA);
    });
  } catch (e) {
    console.error('Failed to parse local storage records:', e);
    return [];
  }
}

/**
 * Create or update a job record
 */
export async function saveJobRecord(
  recordData: Partial<JobRecord> & { title: string; workDateType: JobRecord['workDateType']; startDate: string; tags: string[] },
  userId: string
): Promise<JobRecord> {
  const now = new Date().toISOString();
  const id = recordData.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const fullRecord: JobRecord = {
    id,
    userId,
    title: recordData.title.trim(),
    workplace: recordData.workplace ? recordData.workplace.trim() : '',
    workDateType: recordData.workDateType,
    startDate: recordData.startDate,
    endDate: recordData.endDate ?? null,
    selectedDates: recordData.selectedDates || [recordData.startDate],
    isCurrentlyWorking: Boolean(recordData.isCurrentlyWorking),
    tags: recordData.tags || [],
    jobDescription: recordData.jobDescription ? recordData.jobDescription.trim() : '',
    impression: recordData.impression ? recordData.impression.trim() : '',
    recommendationRating: recordData.recommendationRating ?? null,
    enjoymentRating: recordData.enjoymentRating ?? null,
    busynessRating: recordData.busynessRating ?? null,
    workabilityRating: recordData.workabilityRating ?? null,
    photoUrls: recordData.photoUrls || [],
    createdAt: recordData.createdAt || now,
    updatedAt: now,
  };

  if (hasValidConfig && db) {
    const path = `jobRecords/${id}`;
    try {
      await setDoc(doc(db, 'jobRecords', id), fullRecord);
      return fullRecord;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // Local Storage update
  const key = `${LOCAL_STORAGE_KEY_PREFIX}${userId}`;
  const existing = await getJobRecords(userId);
  const index = existing.findIndex((r) => r.id === id);

  let updatedList: JobRecord[];
  if (index >= 0) {
    updatedList = [...existing];
    updatedList[index] = fullRecord;
  } else {
    updatedList = [fullRecord, ...existing];
  }

  localStorage.setItem(key, JSON.stringify(updatedList));
  return fullRecord;
}

/**
 * Delete a job record
 */
export async function deleteJobRecord(recordId: string, userId: string): Promise<void> {
  if (hasValidConfig && db) {
    const path = `jobRecords/${recordId}`;
    try {
      await deleteDoc(doc(db, 'jobRecords', recordId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }

  // Local Storage deletion
  const key = `${LOCAL_STORAGE_KEY_PREFIX}${userId}`;
  const existing = await getJobRecords(userId);
  const filtered = existing.filter((r) => r.id !== recordId);
  localStorage.setItem(key, JSON.stringify(filtered));
}

/**
 * Convert file to base64 for instant client-side preview & persistent storage
 */
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
