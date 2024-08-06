import React, { useState } from 'react';

function ImageUploader({ onUpload }) {
  const [dragOver, setDragOver] = useState(false);

  const handleImageChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const { width, height } = img;
          
          // Create a canvas with a fixed aspect ratio (e.g., 16:9)
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const targetAspectRatio = 16 / 9;
          let newWidth, newHeight;

          if (width / height > targetAspectRatio) {
            // Image is wider than target aspect ratio
            newWidth = width;
            newHeight = width / targetAspectRatio;
          } else {
            // Image is taller than target aspect ratio or square
            newHeight = height;
            newWidth = height * targetAspectRatio;
          }

          canvas.width = newWidth;
          canvas.height = newHeight;

          // Fill canvas with white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, newWidth, newHeight);

          // Calculate position to center the image
          const x = (newWidth - width) / 2;
          const y = (newHeight - height) / 2;

          // Draw the image centered on the canvas
          ctx.drawImage(img, x, y, width, height);

          // Get the processed image data
          const processedDataUrl = canvas.toDataURL('image/png');
          
          console.log('Processed image dimensions:', newWidth, 'x', newHeight);
          onUpload(processedDataUrl, newWidth, newHeight);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    handleImageChange(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      style={{
        border: dragOver ? '2px dashed blue' : '2px dashed grey',
        padding: '20px',
        textAlign: 'center',
        borderRadius: '5px'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="image-upload"
      />
      <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
        Drag and drop an image here, or click to select a file
      </label>
    </div>
  );
}

export default ImageUploader;