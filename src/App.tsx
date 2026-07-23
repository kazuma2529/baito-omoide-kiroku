import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobRecord, TabType, WorkDateType } from './types';
import { getJobRecords, saveJobRecord, deleteJobRecord } from './lib/storageService';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { FloatingActionButton } from './components/FloatingActionButton';
import { LoginScreen } from './components/LoginScreen';
import { HomeTab } from './components/HomeTab';
import { TimelineTab } from './components/TimelineTab';
import { CalendarTab } from './components/CalendarTab';
import { MyPageTab } from './components/MyPageTab';
import { JobDetailModal } from './components/JobDetailModal';
import { JobRecordFormModal } from './components/JobRecordFormModal';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { BookOpen, Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [records, setRecords] = useState<JobRecord[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Modals state
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<JobRecord | null>(null);
  const [editingRecordForForm, setEditingRecordForForm] = useState<JobRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [initialDateForForm, setInitialDateForForm] = useState<string | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Register Service Worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });
    }
  }, []);

  // Fetch job records when user changes
  const loadRecords = async () => {
    if (!user) {
      setRecords([]);
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    try {
      const data = await getJobRecords(user.uid);
      setRecords(data);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4 text-[#2B2D42]">
        <div className="w-12 h-12 bg-[#E07A5F] text-white rounded-2xl flex items-center justify-center shadow-xs animate-bounce mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="flex items-center space-x-2 text-sm font-semibold text-[#6C757D]">
          <Loader2 className="w-4 h-4 animate-spin text-[#E07A5F]" />
          <span>読み込み中...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Handle Save
  const handleSaveRecord = async (
    recordData: Partial<JobRecord> & { title: string; workDateType: WorkDateType; startDate: string; tags: string[] }
  ) => {
    if (!user) return;
    const saved = await saveJobRecord(recordData, user.uid);
    await loadRecords();
    setIsFormOpen(false);
    setEditingRecordForForm(null);
    setInitialDateForForm(null);

    // If detail modal was open for editing, update it
    if (selectedRecordForDetail && selectedRecordForDetail.id === saved.id) {
      setSelectedRecordForDetail(saved);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingRecordId || !user) return;
    setIsDeleting(true);
    try {
      await deleteJobRecord(deletingRecordId, user.uid);
      await loadRecords();
      setDeletingRecordId(null);
      setSelectedRecordForDetail(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const deletingRecordTitle = records.find((r) => r.id === deletingRecordId)?.title || '';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2D42] flex flex-col font-sans">
      <Header />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4">
        {dataLoading ? (
          <div className="py-12 text-center text-xs text-[#6C757D] flex flex-col items-center space-y-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#E07A5F]" />
            <span>思い出を読み込んでいます...</span>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeTab
                records={records}
                onOpenRecord={(rec) => setSelectedRecordForDetail(rec)}
                onOpenNewForm={() => {
                  setEditingRecordForForm(null);
                  setInitialDateForForm(null);
                  setIsFormOpen(true);
                }}
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineTab
                records={records}
                onOpenRecord={(rec) => setSelectedRecordForDetail(rec)}
                onOpenNewForm={() => {
                  setEditingRecordForForm(null);
                  setInitialDateForForm(null);
                  setIsFormOpen(true);
                }}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarTab
                records={records}
                onOpenRecord={(rec) => setSelectedRecordForDetail(rec)}
                onOpenNewFormWithDate={(dateStr) => {
                  setEditingRecordForForm(null);
                  setInitialDateForForm(dateStr);
                  setIsFormOpen(true);
                }}
              />
            )}

            {activeTab === 'mypage' && <MyPageTab />}
          </>
        )}
      </main>

      {/* Floating Action Button (New Record) */}
      <FloatingActionButton
        onClick={() => {
          setEditingRecordForForm(null);
          setInitialDateForForm(null);
          setIsFormOpen(true);
        }}
      />

      {/* Fixed Bottom Navigation Tabs */}
      <TabNavigation activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Modals & Dialogs */}
      {selectedRecordForDetail && (
        <JobDetailModal
          record={selectedRecordForDetail}
          onClose={() => setSelectedRecordForDetail(null)}
          onEdit={(rec) => {
            setEditingRecordForForm(rec);
            setIsFormOpen(true);
          }}
          onDelete={(recordId) => setDeletingRecordId(recordId)}
        />
      )}

      {isFormOpen && (
        <JobRecordFormModal
          isOpen={isFormOpen}
          editingRecord={editingRecordForForm}
          initialDate={initialDateForForm}
          onClose={() => {
            setIsFormOpen(false);
            setEditingRecordForForm(null);
            setInitialDateForForm(null);
          }}
          onSave={handleSaveRecord}
        />
      )}

      <DeleteConfirmDialog
        isOpen={Boolean(deletingRecordId)}
        title={deletingRecordTitle}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingRecordId(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
