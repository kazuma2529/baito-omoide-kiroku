import { db, storage, auth, hasValidConfig } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from 'firebase/storage';
import { JobRecord } from '../types';
import { INITIAL_MOCK_RECORDS } from './mockData';

const LOCAL_STORAGE_KEY_PREFIX = 'part_time_memory_records_';

export const MAX_PHOTOS = 3;
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024; // 3MB
export const MAX_PHOTO_MB = 3;

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

function isDataUrl(value: string): boolean {
  return value.startsWith('data:');
}

function estimateDataUrlBytes(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex < 0) return dataUrl.length;
  const base64 = dataUrl.slice(commaIndex + 1);
  // Rough decoded size from base64 length
  return Math.floor((base64.length * 3) / 4);
}

/**
 * Upload a data URL or Blob to Firebase Storage and return the download URL.
 */
async function uploadPhotoToStorage(
  source: string | Blob,
  userId: string,
  recordId: string,
  index: number
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not configured');
  }

  let blob: Blob;
  if (typeof source === 'string') {
    const response = await fetch(source);
    blob = await response.blob();
  } else {
    blob = source;
  }

  if (blob.size > MAX_PHOTO_BYTES) {
    throw new Error(`写真は1枚あたり${MAX_PHOTO_MB}MB以下にしてください（${index + 1}枚目が超過）`);
  }

  const contentType = blob.type || 'image/jpeg';
  const ext = contentType.split('/')[1]?.split(';')[0] || 'jpg';
  const path = `jobRecords/${userId}/${recordId}/${Date.now()}_${index}.${ext}`;
  const photoRef = storageRef(storage, path);

  await uploadBytes(photoRef, blob, { contentType });
  return getDownloadURL(photoRef);
}

/**
 * Resolve photoUrls: upload any data URLs to Storage, keep existing http(s) URLs.
 */
async function resolvePhotoUrls(
  photoUrls: string[],
  userId: string,
  recordId: string
): Promise<string[]> {
  const limited = photoUrls.slice(0, MAX_PHOTOS);

  // Size-check data URLs in all modes
  for (let i = 0; i < limited.length; i++) {
    const url = limited[i];
    if (isDataUrl(url) && estimateDataUrlBytes(url) > MAX_PHOTO_BYTES) {
      throw new Error(`写真は1枚あたり${MAX_PHOTO_MB}MB以下にしてください（${i + 1}枚目が超過）`);
    }
  }

  const canUseStorage = Boolean(hasValidConfig && storage && auth?.currentUser);
  if (!canUseStorage) {
    return limited;
  }

  const storageUserId = auth!.currentUser!.uid;
  // Path must match storage rules (request.auth.uid == userId)
  if (storageUserId !== userId) {
    console.warn('Auth uid and record userId differ; using auth uid for Storage path');
  }

  const resolved: string[] = [];
  for (let i = 0; i < limited.length; i++) {
    const url = limited[i];
    if (isDataUrl(url)) {
      resolved.push(await uploadPhotoToStorage(url, storageUserId, recordId, i));
    } else {
      resolved.push(url);
    }
  }
  return resolved;
}

async function deleteRecordPhotos(userId: string, recordId: string): Promise<void> {
  if (!storage) return;
  try {
    const folderRef = storageRef(storage, `jobRecords/${userId}/${recordId}`);
    const listed = await listAll(folderRef);
    await Promise.all(listed.items.map((item) => deleteObject(item)));
  } catch (err) {
    console.warn('Failed to delete storage photos:', err);
  }
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
          photoUrls: Array.isArray(data.photoUrls) ? data.photoUrls.slice(0, MAX_PHOTOS) : [],
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

  const photoUrls = await resolvePhotoUrls(recordData.photoUrls || [], userId, id);

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
    photoUrls,
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
      // Fall through to local storage only when photos are already remote URLs
      // (or local mode). Avoid silently "succeeding" with oversized data URLs.
      const stillHasDataUrl = fullRecord.photoUrls.some(isDataUrl);
      if (stillHasDataUrl) {
        throw err instanceof Error ? err : new Error(String(err));
      }
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
      await deleteRecordPhotos(userId, recordId);
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
 * Convert file to base64 for instant client-side preview.
 * Actual persistence uses Firebase Storage on save.
 */
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
