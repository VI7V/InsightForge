import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useLazyQuery } from '@apollo/client';
import { UPLOAD_FILE, GET_DASHBOARD } from '../../utils/apollo';
import { DashboardData } from '../../types';
import './Upload.css';

interface UploadProps {
  onComplete: (data: DashboardData) => void;
  onCancel: () => void;
}

const STEPS = ['Parsing CSV data', 'Aggregating sales metrics', 'Running forecasting models', 'Detecting anomalies', 'Segmenting customers', 'Analyzing sentiment', 'Generating AI insights', 'Finalizing dashboard'];

export const Upload: React.FC<UploadProps> = ({ onComplete, onCancel }) => {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'error'>('idle');
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState('');

  const [uploadFile] = useMutation(UPLOAD_FILE);
  const [getDashboard] = useLazyQuery(GET_DASHBOARD);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setFileName(file.name);
    setStatus('uploading');
    setError('');
    setStep(0);

    try {
      const content = await file.text();
      const base64 = btoa(unescape(encodeURIComponent(content)));

      setStatus('processing');
      const stepInterval = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 2)), 1800);

      const result = await uploadFile({ variables: { fileContent: base64, fileName: file.name } });
      const uploadResult = result.data?.uploadFile;
      if (!uploadResult || uploadResult.status === 'error') throw new Error(uploadResult?.message || 'Upload failed');

      clearInterval(stepInterval);
      setStep(STEPS.length - 1);

      let attempts = 0;
      const poll = async (): Promise<DashboardData> => {
        const res = await getDashboard({ variables: { id: uploadResult.id } });
        const data = res.data?.getDashboardData;
        if (data) return data;
        if (attempts++ > 30) throw new Error('Processing timed out. Please try again.');
        await new Promise(r => setTimeout(r, 1000));
        return poll();
      };

      const dashboard = await poll();
      onComplete(dashboard);
    } catch (err: any) {
      setError(err.message || 'Processing failed');
      setStatus('error');
    }
  }, [uploadFile, getDashboard, onComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/csv': ['.csv'] }, multiple: false, disabled: status !== 'idle',
  });

  return (
    <div className="upload-page">
      <div className="upload-page__inner">
        <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ marginBottom: 24 }}>← Back</button>

        <h2 className="upload-page__title">Upload Dataset</h2>
        <p className="upload-page__sub">Supports CSV files with sales, customer, and feedback data</p>

        {status === 'idle' && (
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone--active' : ''}`}>
            <input {...getInputProps()} />
            <div className="dropzone__icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="14" fill="var(--accent-glow)" />
                <path d="M24 14v20M14 24l10-10 10 10" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 36h24" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="dropzone__title">{isDragActive ? 'Release to upload' : 'Drop your CSV here'}</p>
            <p className="dropzone__sub">or click to browse · max 50MB</p>
            <div className="dropzone__tags">
              {['date', 'sales_amount', 'customer_id', 'feedback_text', 'purchase_frequency', 'recency_days'].map(t => (
                <span key={t} className="dropzone__tag">{t}</span>
              ))}
            </div>
          </div>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <div className="upload-progress card">
            <div className="upload-progress__file">
              <span className="upload-progress__filename">{fileName}</span>
              <span className="badge badge-blue">Processing</span>
            </div>
            <div className="upload-steps">
              {STEPS.map((s, i) => (
                <div key={i} className={`upload-step ${i <= step ? 'upload-step--done' : ''} ${i === step ? 'upload-step--active' : ''}`}>
                  <div className="upload-step__dot">
                    {i < step ? '✓' : i === step ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : ''}
                  </div>
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div className="upload-progress__bar">
              <div className="upload-progress__fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="upload-error card">
            <div className="upload-error__icon">⚠️</div>
            <h3>Processing Failed</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => setStatus('idle')}>Try Again</button>
          </div>
        )}

        <div className="upload-tips">
          <h4>Required columns</h4>
          <div className="upload-tips__grid">
            {[
              { col: 'date', note: 'YYYY-MM-DD format', req: true },
              { col: 'sales_amount', note: 'Numeric revenue value', req: true },
              { col: 'customer_id', note: 'Unique customer identifier', req: true },
              { col: 'product_category', note: 'Product/service category', req: false },
              { col: 'region', note: 'Geographic region', req: false },
              { col: 'feedback_text', note: 'Customer review text', req: false },
              { col: 'purchase_frequency', note: 'Number of purchases', req: false },
              { col: 'recency_days', note: 'Days since last purchase', req: false },
            ].map(({ col, note, req }) => (
              <div key={col} className="upload-tip-row">
                <span className="upload-tip-col">{col}</span>
                <span className={`badge ${req ? 'badge-blue' : 'badge-amber'}`}>{req ? 'Required' : 'Optional'}</span>
                <span className="upload-tip-note">{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
