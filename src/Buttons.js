const Buttons = ({ unhideAllBoxes, startLiveWireTracing, isLiveWireTracingActive, startFreehandDrawing, isDrawingFreehand, clearFreehandDrawings, isHybridDrawingActive, setIsHybridDrawing, selectedAnnotation, isEraserActive, handleEraserClick, undo, redo, currentStep, history }) => {
  return (
    <div>
      <button onClick={unhideAllBoxes}>Unhide All Boxes</button>
      <button onClick={startLiveWireTracing}>{!isLiveWireTracingActive?'Start LiveWire Tracing':'Stop LiveWire Tracing'}</button>
      {!isDrawingFreehand?<button onClick={startFreehandDrawing}>Start Freehand Drawing</button>:<button onClick={clearFreehandDrawings}>Stop Freehand Drawing</button>}
      <button onClick={() => setIsHybridDrawing(!isHybridDrawingActive)}>
        {isHybridDrawingActive ? 'Stop Hybrid Drawing' : 'Start Hybrid Drawing'}
      </button>
      {selectedAnnotation && (
        <button onClick={handleEraserClick}>
          {isEraserActive ? 'Stop Erasing' : 'Eraser'}
        </button>
      )}
      <button onClick={undo} disabled={currentStep <= 0}>Undo</button>
      <button onClick={redo} disabled={currentStep >= history.length - 1}>Redo</button>
    </div>
  );
};

export default Buttons