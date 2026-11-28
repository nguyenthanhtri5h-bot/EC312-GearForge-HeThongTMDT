import { useEffect, useState } from 'react';

interface EkycUploadFieldProps {
  id: string;
  name: string;
  label: string;
  btnLabel: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

export function EkycUploadField({ id, name, label, btnLabel, file, onChange }: EkycUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="gf-field-col">
      <label htmlFor={id} className="gf-field-label">{label}</label>
      <div className="gf-tool-file-row">
        <input
          id={id}
          name={name}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="gf-tool-file-native"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          required
        />
        <label htmlFor={id} className="gf-tool-file-btn">{btnLabel}</label>
        <span className="gf-tool-file-name">{file ? file.name : 'Chưa chọn tệp'}</span>
      </div>
      {previewUrl && (
        <div className="gf-ekyc-preview">
          <img src={previewUrl} alt={`Xem trước ${label}`} />
          <span>Đã nạp ảnh ({Math.max(1, Math.round((file?.size || 0) / 1024))} KB)</span>
        </div>
      )}
      {!previewUrl && file && (
        <div className="gf-ekyc-preview is-pdf">
          <span>Tài liệu PDF sẵn sàng ({Math.max(1, Math.round(file.size / 1024))} KB)</span>
        </div>
      )}
    </div>
  );
}
