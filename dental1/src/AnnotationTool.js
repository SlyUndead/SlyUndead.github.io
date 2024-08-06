import React, { useState, useEffect, useRef } from 'react';
import Canvas from './Canvas';
import Dialog from './Dialog';
import Buttons from './Buttons';
import AnnotationList from './AnnotationList';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_HISTORY } from './constants';
import { getBoxDimensions, drawAnnotations } from './Annotations';

const AnnotationTool = ({ imageSrc, coordinates }) => {
  const [annotations, setAnnotations] = useState([]);
  const [hiddenAnnotations, setHiddenAnnotations] = useState([]);
  const [drawingBox, setDrawingBox] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [newBoxLabel, setNewBoxLabel] = useState('');
  const [newBoxVertices, setNewBoxVertices] = useState([]);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);
  const [drawingPaths, setDrawingPaths] = useState([]);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isLiveWireTracingActive, setIsLiveWireTracingActive] = useState(false);
  const [hoveredAnnotation, setHoveredAnnotation] = useState(null);
  const [isHybridDrawingActive, setIsHybridDrawing] = useState(false)
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const handleEraserClick = () => {
    setIsEraserActive(!isEraserActive);
  };
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImage(img);
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const scale = Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
      const x = (CANVAS_WIDTH / 2) - (img.width / 2) * scale;
      const y = (CANVAS_HEIGHT / 2) - (img.height / 2) * scale;
      setX(x);
      setY(y);
      setScale(scale);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };
  }, [imageSrc]);

  useEffect(() => {
    const initialAnnotations = coordinates.reduce((acc, coord) => {
      if (!acc.some(anno => JSON.stringify(anno.vertices) === JSON.stringify(coord.vertices))) {
        return [...acc, coord];
      }
      return acc;
    }, []);
    setAnnotations(initialAnnotations);
  }, [coordinates]);
  const updateAnnotationsWithHistory = (newAnnotations) => {
    setAnnotations(newAnnotations);
    setHistory(prevHistory => {
      const newHistory = [...prevHistory.slice(0, currentStep + 1), newAnnotations];
      return newHistory.slice(-MAX_HISTORY);
    });
    setCurrentStep(prevStep => Math.min(prevStep + 1, MAX_HISTORY - 1));
  };
  const undo = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
      setAnnotations(history[currentStep - 1]);
    }
  };
  const redo = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
      setAnnotations(history[currentStep + 1]);
    }
  };
  const createBoxes = (label) => {
    const newAnnotations = coordinates.filter(coord => {
      return coord.label === label && !annotations.some(anno => 
        JSON.stringify(anno.vertices) === JSON.stringify(coord.vertices)
      );
    });
    setAnnotations([...annotations, ...newAnnotations]);
  };

  const deleteBox = (id) => {
    setAnnotations(annotations.filter((_, index) => index !== id));
    setShowDialog(false);
    setIsDrawingActive(false);
  };

  const hideBox = (id) => {
    setHiddenAnnotations([...hiddenAnnotations, id]);
  };

  const unhideBox = (id) => {
    setHiddenAnnotations(hiddenAnnotations.filter(hid => hid !== id));
  };

  const unhideAllBoxes = () => {
    setHiddenAnnotations([]);
  };

  const handleLabelChange = (e) => {
    setNewBoxLabel(e.target.value);
  };
  

  const handleAddBox = () => {
    const newAnnotation = {
      label: newBoxLabel,
      vertices: newBoxVertices
    };
    // setAnnotations([...annotations, newAnnotation]);
    setShowDialog(false);
    setIsDrawingActive(false);
    setNewBoxLabel('');
    setNewBoxVertices([]);
    setIsLiveWireTracingActive(false);
    updateAnnotationsWithHistory([...annotations, newAnnotation]);
    setIsDrawingFreehand(false);
    setIsHybridDrawing(false);
  };
  useEffect(()=>{
    console.log(selectedAnnotation)
    if(selectedAnnotation===null){
      setIsEraserActive(false)
    }
  },[selectedAnnotation])
  useEffect(()=>{
    const ctx = canvasRef.current.getContext('2d');
    drawAnnotations(ctx, annotations, hiddenAnnotations, image, x, y, scale,selectedAnnotation)
  },[annotations])
  const handleCloseDialog = () => {
    setShowDialog(false);
    setDrawingBox(null);
    setIsDrawingActive(false);
    setIsLiveWireTracingActive(false);
    setIsDrawingFreehand(false);
    setNewBoxLabel('');
    setIsHybridDrawing(false);
    setNewBoxVertices([]);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
    drawAnnotations(ctx, annotations, hiddenAnnotations, image, x, y, scale,selectedAnnotation);
  };
  const startHybridTracing = () => {
    if(!isHybridDrawingActive){
      setIsLiveWireTracingActive(false);
      setIsDrawingFreehand(false);
      setIsEraserActive(false);
      setSelectedAnnotation(null);
      setIsHybridDrawing(true);
    }
    else{
      setIsHybridDrawing(false);
    }
  };
  const startLiveWireTracing = () => {
    if(!isLiveWireTracingActive){
      setIsLiveWireTracingActive(true);
      setIsDrawingFreehand(false);
      setIsEraserActive(false);
      setSelectedAnnotation(null);
      setIsHybridDrawing(false);
    }
    else{
      setIsLiveWireTracingActive(false);
    }
  };
  const startFreehandDrawing=()=>{
    setSelectedAnnotation(null);
    setIsLiveWireTracingActive(false);
    setIsEraserActive(false);
    setIsHybridDrawing(false);
    setIsDrawingFreehand(true);
  }
  const clearFreehandDrawings = () => {
    setDrawingPaths([]);
    setIsDrawingFreehand(false);
  };
  const handleErase = (erasePoints) => {
    if (isEraserActive && selectedAnnotation) {
      const updatedVertices = selectedAnnotation.vertices.filter(vertex => {
        return !erasePoints.some(erasePoint => {
          const dx = vertex.x - erasePoint.x;
          const dy = vertex.y - erasePoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance <= 5 / scale;
        });
      });
  
      const updatedAnnotation = { ...selectedAnnotation, vertices: updatedVertices };
      const newAnnotations = annotations.map(anno => 
        anno === selectedAnnotation ? updatedAnnotation : anno
      );
      setAnnotations(newAnnotations);
      setSelectedAnnotation(updatedAnnotation);
    }
  };
  const updateHistory = () => {
    setHistory(prevHistory => [...prevHistory.slice(0, currentStep + 1), annotations]);
    setCurrentStep(prevStep => prevStep + 1);
  };

  return (
    <div style={{ display: 'flex' }}>
      <AnnotationList
        annotations={annotations}
        hiddenAnnotations={hiddenAnnotations}
        deleteBox={deleteBox}
        hideBox={hideBox}
        unhideBox={unhideBox}
        setHoveredAnnotation={setHoveredAnnotation}
        setSelectedAnnotation={setSelectedAnnotation}
        selectedAnnotation={selectedAnnotation}
      />
      <div style={{ position: 'relative', flex: 1 }}>
        <Buttons
          uniqueLabels={[...new Set(coordinates.map(coord => coord.label))]}
          createBoxes={createBoxes}
          unhideAllBoxes={unhideAllBoxes}
          startLiveWireTracing={startLiveWireTracing}
          isLiveWireTracingActive={isLiveWireTracingActive}
          startFreehandDrawing={startFreehandDrawing}
          isDrawingFreehand={isDrawingFreehand}
          clearFreehandDrawings={clearFreehandDrawings}
          isHybridDrawingActive={isHybridDrawingActive}
          setIsHybridDrawing={startHybridTracing}
          isEraserActive={isEraserActive}
          handleEraserClick={handleEraserClick}
          selectedAnnotation={selectedAnnotation}
          undo={undo}
          redo={redo}
          history={history}
          currentStep={currentStep}
          
        />
        <Canvas
          canvasRef={canvasRef}
          image={image}
          x={x}
          y={y}
          scale={scale}
          annotations={annotations}
          hiddenAnnotations={hiddenAnnotations}
          drawingBox={drawingBox}
          setDrawingBox={setDrawingBox}
          isDrawingActive={isDrawingActive}
          setShowDialog={setShowDialog}
          setNewBoxVertices={setNewBoxVertices}
          deleteBox={deleteBox}
          hideBox={hideBox}
          isLiveWireTracingActive={isLiveWireTracingActive}
          setIsLiveWireTracingActive={setIsLiveWireTracingActive}
          hoveredAnnotation={hoveredAnnotation}
          isDrawingFreehand={isDrawingFreehand}
          setIsDrawingFreehand={setIsDrawingFreehand}
          drawingPaths={drawingPaths}
          setDrawingPaths={setDrawingPaths}
          isHybridDrawingActive={isHybridDrawingActive}
          setIsHybridDrawing={startHybridTracing}
          selectedAnnotation={selectedAnnotation}
          setSelectedAnnotation={setSelectedAnnotation}
          updateAnnotation={(updatedAnnotation) => {
            setAnnotations(annotations.map(anno => 
              anno === selectedAnnotation ? updatedAnnotation : anno
            ));
            setSelectedAnnotation(null);
          }}
          isEraserActive={isEraserActive}
          handleErase={handleErase}
          updateHistory={updateHistory}
        />
        {showDialog && (
          <Dialog
            uniqueLabels={[...new Set(coordinates.map(coord => coord.label))]}
            handleLabelChange={handleLabelChange}
            handleAddBox={handleAddBox}
            handleCloseDialog={handleCloseDialog}
            newBoxLabel={newBoxLabel}
          />
        )}
      </div>
    </div>
  );
};

export default AnnotationTool;