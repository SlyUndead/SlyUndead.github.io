import React, { useState, useEffect } from 'react';
import AnnotationTool from './AnnotationTool';
import ImageUploader from './ImageUploader';
import axios from 'axios';

function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (imageSrc) => {
    setImageSrc(imageSrc);
  };

  useEffect(() => {
    const fetchCoordinates = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:5000/coordinates'); 
        console.log(response.data)
        setCoordinates(response.data);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoordinates();
  }, []);

  return (
    <div>
      {imageSrc?<></>:<ImageUploader onUpload={handleImageUpload} />}
      {isLoading && <p>Loading coordinates...</p>}
      {imageSrc && (
        <AnnotationTool
          imageSrc={imageSrc}
          coordinates={coordinates}
        />
      )}
    </div>
  );
}

export default App;