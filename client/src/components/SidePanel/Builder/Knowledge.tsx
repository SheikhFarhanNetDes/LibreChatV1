import { useState, useRef, useEffect } from 'react';
import { EModelEndpoint, retrievalMimeTypes } from 'librechat-data-provider';
import type { ExtendedFile } from '~/common';
import { useChatContext } from '~/Providers';
import FileRow from '~/components/Chat/Input/Files/FileRow';
import { useFileHandling } from '~/hooks/Files';

const CodeInterpreterFiles = ({ children }: { children: React.ReactNode }) => (
  <div>
    <div className="text-token-text-tertiary mb-2 text-xs">
      The following files are only available for Code Interpreter:
    </div>
    {/* Files available to Code Interpreter only */}
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

export default function Knowledge({
  assistant_id,
  files: _files,
}: {
  assistant_id: string;
  files?: [string, ExtendedFile][];
}) {
  const { setFilesLoading } = useChatContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<Map<string, ExtendedFile>>(new Map());
  const { handleFileChange } = useFileHandling({
    overrideEndpoint: EModelEndpoint.assistant,
    additionalMetadata: { assistant_id },
    fileSetter: setFiles,
  });

  useEffect(() => {
    if (_files) {
      setFiles(new Map(_files));
    }
  }, [_files]);

  const handleButtonClick = () => {
    // necessary to reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-6">
      <div className="mb-1.5 flex items-center">
        <span>
          <label className="text-token-text-primary block font-medium">Knowledge</label>
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-token-text-tertiary rounded-lg">
          If you upload files under Knowledge, conversations with your Assistant may include file
          contents. Files can be downloaded when Code Interpreter is enabled
        </div>
        {/* Files available to both tools */}
        <FileRow
          files={files}
          setFiles={setFiles}
          setFilesLoading={setFilesLoading}
          assistant_id={assistant_id}
          fileFilter={(file: ExtendedFile) =>
            retrievalMimeTypes.some((regex) => regex.test(file.type ?? ''))
          }
          Wrapper={({ children }) => <div className="flex flex-wrap gap-2">{children}</div>}
        />
        <FileRow
          files={files}
          setFiles={setFiles}
          setFilesLoading={setFilesLoading}
          assistant_id={assistant_id}
          fileFilter={(file: ExtendedFile) =>
            !retrievalMimeTypes.some((regex) => regex.test(file.type ?? ''))
          }
          Wrapper={CodeInterpreterFiles}
        />
        <div>
          <button
            type="button"
            className="btn btn-neutral border-token-border-light relative h-8 rounded-lg font-medium"
            onClick={handleButtonClick}
          >
            <div className="flex w-full items-center justify-center gap-2">
              <input
                multiple={true}
                type="file"
                style={{ display: 'none' }}
                tabIndex={-1}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              Upload files
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}