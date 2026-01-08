import React from 'react';
import { X, Download, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';

const DocumentViewer = ({ document, onClose }) => {
  const [zoom, setZoom] = React.useState(100);

  if (!document) return null;

  const isImage = document.fileType?.startsWith('image/');
  const isPDF = document.fileType === 'application/pdf';

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />

      {/* Viewer Container */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{document.fileName}</h3>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {isImage && (
              <>
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
                  title="Zoom out"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="text-sm">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
                  title="Zoom in"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <div className="w-px h-6 bg-gray-600 mx-2" />
              </>
            )}
            <a
              href={document.downloadURL}
              download={document.fileName}
              className="p-2 hover:bg-gray-700 rounded"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </a>
            <a
              href={document.downloadURL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-700 rounded"
              title="Open in new tab"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-800 flex items-center justify-center p-4">
          {isImage && (
            <img
              src={document.downloadURL}
              alt={document.fileName}
              className="max-w-full max-h-full object-contain transition-transform"
              style={{ transform: `scale(${zoom / 100})` }}
            />
          )}
          {isPDF && (
            <iframe
              src={`${document.downloadURL}#view=FitH`}
              title={document.fileName}
              className="w-full h-full bg-white rounded"
              style={{ minHeight: '80vh' }}
            />
          )}
          {!isImage && !isPDF && (
            <div className="text-center text-white">
              <p className="mb-4">Preview not available for this file type.</p>
              <a
                href={document.downloadURL}
                download={document.fileName}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
