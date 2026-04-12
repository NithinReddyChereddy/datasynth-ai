import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileCode, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploaderProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  loadingPhase: 'uploading' | 'analyzing' | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isUploading, loadingPhase }) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    disabled: isUploading
  });

  return (
    <div
      {...getRootProps()}
      className={`relative group cursor-pointer transition-all duration-500 overflow-hidden rounded-[2rem] border-2 border-dashed
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-[var(--card-border)] hover:border-primary/30 hover:bg-white/5'}
        ${isUploading ? 'pointer-events-none opacity-80' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="p-12 flex flex-col items-center justify-center space-y-6 text-center relative z-10">
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-black italic tracking-tighter uppercase">
                    {loadingPhase === 'uploading' ? 'Uploading dataset...' : 'Analyzing data...'}
                </p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
                  {selectedFile ? `Processing ${selectedFile.name}` : ''}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500
                ${isDragActive ? 'bg-primary text-black scale-110 shadow-2xl' : 'bg-primary/5 text-[var(--subtext)] group-hover:bg-primary/10 group-hover:text-primary group-hover:rotate-12'}
              `}>
                <Upload className="w-10 h-10" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tighter uppercase italic">Upload Dataset</h3>
                <p className="text-[10px] font-bold text-[var(--subtext)] uppercase tracking-[0.2em]">Drag and drop CSV or Excel files here</p>
              </div>

              <div className="flex gap-4 pt-4">
                <div className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[9px] font-bold text-[var(--subtext)] uppercase tracking-widest flex items-center gap-2 shadow-sm">
                   <FileCode className="w-3.5 h-3.5" />
                   CSV v2.0
                </div>
                <div className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[9px] font-bold text-[var(--subtext)] uppercase tracking-widest flex items-center gap-2 shadow-sm">
                   <CheckCircle2 className="w-3.5 h-3.5" />
                   Excel AI
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative side blurs */}
      <div className="absolute top-0 left-0 w-32 h-full bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-32 h-full bg-secondary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

