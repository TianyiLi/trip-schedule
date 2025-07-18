import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, File, Calendar, HardDrive, Upload, Download, Plus } from 'lucide-react';
import { GoogleDriveFile, GoogleDriveService } from '../services/GoogleDriveService';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

interface FileSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'backup' | 'restore';
  onFileSelected: (fileName: string) => void;
}

const FileSelectionDialog: React.FC<FileSelectionDialogProps> = ({
  isOpen,
  onClose,
  mode,
  onFileSelected,
}) => {
  const { t } = useTranslation();
  const { getAccessToken } = useGoogleAuth();
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);

  const loadFiles = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const fileList = await GoogleDriveService.listTripFiles(accessToken);
      setFiles(fileList);
    } catch (err) {
      console.error('Error loading files:', err);
      setError(t('settings.sync.fileLoadError'));
    } finally {
      setLoading(false);
    }
  }, [t, getAccessToken]);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, loadFiles]);

  const handleFileSelect = () => {
    if (mode === 'backup' && showNewFileInput && newFileName.trim()) {
      const fileName = newFileName.trim().endsWith('.json') 
        ? newFileName.trim() 
        : `${newFileName.trim()}.json`;
      onFileSelected(fileName);
      handleClose();
    } else if (selectedFile) {
      onFileSelected(selectedFile);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setNewFileName('');
    setShowNewFileInput(false);
    setError(null);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'backup' ? t('settings.sync.selectBackupFile') : t('settings.sync.selectRestoreFile')}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              <span className="ml-2 text-gray-600">{t('common.loading')}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {mode === 'backup' && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowNewFileInput(!showNewFileInput)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    <span>{t('settings.sync.createNewFile')}</span>
                  </button>
                  
                  {showNewFileInput && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder={t('settings.sync.enterFileName')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              )}

              {files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <HardDrive size={48} className="mx-auto mb-2 opacity-50" />
                  <p>{t('settings.sync.noFilesFound')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(file.name)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedFile === file.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <File size={20} className="text-gray-500" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{formatDate(file.modifiedTime)}</span>
                            </span>
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleFileSelect}
            disabled={!selectedFile && !(mode === 'backup' && showNewFileInput && newFileName.trim())}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedFile || (mode === 'backup' && showNewFileInput && newFileName.trim())
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {mode === 'backup' ? <Upload size={16} /> : <Download size={16} />}
            <span>
              {mode === 'backup' ? t('settings.sync.backup') : t('settings.sync.restore')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileSelectionDialog;