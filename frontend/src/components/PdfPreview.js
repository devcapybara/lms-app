import React from 'react';

const PdfPreview = ({ fileUrl, height = 400 }) => {
  
  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden">
      {/* Try direct PDF first */}
      <object
        data={fileUrl}
        type="application/pdf"
        width="100%"
        height={height}
        style={{ border: 'none' }}
      >
        {/* Fallback to iframe */}
        <iframe
          src={fileUrl}
          title="PDF Preview"
          width="100%"
          height={height}
          style={{ border: 'none' }}
        >
          {/* Final fallback */}
          <div className="p-4 text-center text-gray-400">
            <p>PDF tidak dapat ditampilkan di browser ini.</p>
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Download PDF
            </a>
          </div>
        </iframe>
      </object>
    </div>
  );
};

export default PdfPreview; 