import React, { useRef } from 'react';

type FileUploadProps = {
  onFilesSelected: (files: FileList) => void;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
};

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  children,
  onClick,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (onClick) {
      onClick();
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelected(event.target.files);
    }
  };

  return (
    <div onClick={handleButtonClick} style={{ cursor: 'pointer' }} className={className}>
      {children}
      <input
        ref={fileInputRef}
        multiple
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUpload;
