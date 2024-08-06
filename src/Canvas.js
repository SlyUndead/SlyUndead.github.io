import React, { useEffect, useState, useRef } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { drawAnnotations } from './Annotations';
import { LivewireScissors } from './cornerstone3D/packages/tools/src/utilities/livewire/LivewireScissors.ts';
import { modifyPath } from './path-utils';

const Canvas = ({
  canvasRef,
  image,
  x,
  y,
  scale,
  annotations,
  hiddenAnnotations,
  setShowDialog,
  setNewBoxVertices,
  isLiveWireTracingActive,
  setIsLiveWireTracingActive,
  hoveredAnnotation,
  isDrawingFreehand,
  setIsDrawingFreehand,
  isHybridDrawingActive,
  setIsHybridDrawing,
  selectedAnnotation,
  setSelectedAnnotation,
  updateAnnotation,
  isEraserActive,
  handleErase,
  updateHistory,
}) => {
  const [fixedPoints, setFixedPoints] = useState([]);
  const [erasePoints, setErasePoints] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isLiveWireTracing, setIsLiveWireTracing] = useState(false);
  const [drawingPaths, setDrawingPaths] = useState([]);
  const livewireRef = useRef(null);
  const SNAP_THRESHOLD = 10;
  const BRUSH_SIZE = 5;
  const isDrawingRef = useRef(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hybridPath, setHybridPath] = useState([]);
  const [livewirePath, setLivewirePath] = useState([]);
  const startPointRef = useRef(null);
  const lastPointRef = useRef(null);
  const isDrawingStartedRef = useRef(false);
  const [editingPath, setEditingPath] = useState([]);
  const [subtractPath, setSubtractPath] = useState(false);
  const isErasing = useRef(false);
  const eraserSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" class="bi bi-eraser-fill" viewBox="0 0 16 16">
                      <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/>
                    </svg>`;
  const eraserCursor = `url("data:image/svg+xml,${encodeURIComponent(eraserSvg)}") 8 8, auto`;
  useEffect(() => {
    if (selectedAnnotation) {
      setEditingPath([]);
    }
  }, [selectedAnnotation]);
  useEffect(() => {
    if (image && isLiveWireTracingActive) {
      const ctx = canvasRef.current.getContext('2d');
      const imageData = ctx.getImageData(x, y, image.width * scale, image.height * scale);
      livewireRef.current = LivewireScissors.createInstanceFromRawPixelData(
        new Float32Array(imageData.data),
        image.width * scale,
        image.height * scale,
        { lower: 0, upper: 255 }
      );
    }
  }, [image, isLiveWireTracingActive, x, y, scale]);
  useEffect(()=>{
    setEditingPath([])
  },[isDrawingFreehand])
  useEffect(() => {
    if (image) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
      
      drawAnnotations(ctx, annotations, hiddenAnnotations, hoveredAnnotation, image, x, y, scale,selectedAnnotation);
      if (isEraserActive && erasePoints.length >= 1) {
        // ctx.beginPath();
        // ctx.moveTo(erasePoints[0].x, erasePoints[0].y);
        // for (let i = 1; i < erasePoints.length; i++) {
        //   ctx.lineTo(erasePoints[i].x, erasePoints[i].y);
        // }
        // ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        // ctx.lineWidth = 1;
        // ctx.stroke();
      }
      if (selectedAnnotation && editingPath.length > 0&&!isEraserActive) {
        drawEditingPath(ctx);
      }
      
      if (isDrawingFreehand) {
        drawFreehandPath(ctx);
      }
      
      if (isLiveWireTracing) {
        drawLivewirePath(ctx);
      }
      
      if (isHybridDrawingActive) {
        drawHybridPath([...hybridPath, ...livewirePath]);
      }
    }
  }, [image, x, y, scale, annotations, hiddenAnnotations, hoveredAnnotation, selectedAnnotation, 
      editingPath, isDrawingFreehand, drawingPaths, isLiveWireTracing, fixedPoints, currentPath, 
      isHybridDrawingActive, hybridPath, livewirePath,erasePoints]);

  const drawEditingPath = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(editingPath[0][0] + x, editingPath[0][1] + y);
    for (let i = 1; i < editingPath.length; i++) {
      ctx.lineTo(editingPath[i][0] + x, editingPath[i][1] + y);
    }
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  useEffect(() => {
    if (!isHybridDrawingActive) {
      setHybridPath([]);
      setLivewirePath([]);
      startPointRef.current = null;
      isDrawingStartedRef.current = false;
    }
  }, [isHybridDrawingActive]);
  const drawHybridPath = (path) => {
    const ctx = canvasRef.current.getContext('2d');
    if (path.length > 0) {
      ctx.beginPath();
      ctx.moveTo(path[0][0] + x, path[0][1] + y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0] + x, path[i][1] + y);
      }
      ctx.strokeStyle = 'purple';
      ctx.lineWidth = 2;
      ctx.stroke();
  
      // Draw start point
      if (startPointRef.current) {
        ctx.beginPath();
        ctx.arc(startPointRef.current[0] + x, startPointRef.current[1] + y, SNAP_THRESHOLD, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fill();
      }
    }
  };

  const completeHybridDrawing = () => {
    const vertices = hybridPath.map(point => ({ x: point[0] + x, y: point[1] + y }));
    setNewBoxVertices(vertices);
    setShowDialog(true);
    setIsHybridDrawing(false);
    setHybridPath([]);
    setLivewirePath([]);
    startPointRef.current = null;
    isDrawingStartedRef.current = false;
  };


  useEffect(() => {
    if (image && isHybridDrawingActive) {
      const ctx = canvasRef.current.getContext('2d');
      const imageData = ctx.getImageData(x, y, image.width * scale, image.height * scale);
      livewireRef.current = LivewireScissors.createInstanceFromRawPixelData(
        new Float32Array(imageData.data),
        image.width * scale,
        image.height * scale,
        { lower: 0, upper: 255 }
      );
    }
  }, [image, isHybridDrawingActive, x, y, scale]);


  const handleMouseDown = (e) => {
    if (isEraserActive && selectedAnnotation) {
      isErasing.current = true;
      const newPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
      setErasePoints([newPoint]);
    }
    if (selectedAnnotation&&!isEraserActive) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickPoint = [
        Math.round(e.clientX - rect.left - x),
        Math.round(e.clientY - rect.top - y)
      ];
      setEditingPath([clickPoint]); // Start a new editing path
      isDrawingRef.current = true;
      console.log(e.button)
        if (e.button === 0) {
            setSubtractPath(false);
        } else if (e.button === 2) {
            setSubtractPath(true);
        } else if (e.button ===1){
            
        }
    } 
    if (isHybridDrawingActive) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickPoint = [
        Math.round(e.clientX - rect.left - x),
        Math.round(e.clientY - rect.top - y)
      ];

      if (!isDrawingStartedRef.current) {
        // Start a new drawing
        startPointRef.current = clickPoint;
        setHybridPath([clickPoint]);
        isDrawingStartedRef.current = true;
      } else {
        // Check if the click is near the start point
        const distance = Math.sqrt(
          Math.pow(clickPoint[0] - startPointRef.current[0], 2) +
          Math.pow(clickPoint[1] - startPointRef.current[1], 2)
        );

        if (distance <= SNAP_THRESHOLD && hybridPath.length > 2) {
          completeHybridDrawing();
        } else {
          setHybridPath([...hybridPath, ...livewirePath, clickPoint]);
        }
      }

      setIsMouseDown(true);
      livewireRef.current.startSearch(clickPoint);
      setLivewirePath([]);
      lastPointRef.current = clickPoint;
    }
    if (isLiveWireTracingActive) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickPoint = [
        Math.round(e.clientX - rect.left - x),
        Math.round(e.clientY - rect.top - y)
      ];

      if (!isLiveWireTracing) {
        setFixedPoints([clickPoint]);
        setIsLiveWireTracing(true);
      } else {
        setFixedPoints([...fixedPoints, ...currentPath]);
      }

      livewireRef.current.startSearch(clickPoint);
      setCurrentPath([]);

      // Check if the polygon is complete
      if (fixedPoints.length > 0) {
        const firstPoint = fixedPoints[0];
        const distance = Math.sqrt(
          (clickPoint[0] - firstPoint[0]) ** 2 + (clickPoint[1] - firstPoint[1]) ** 2
        );
        if (distance < SNAP_THRESHOLD && fixedPoints.length > 2) {
          completePolygon();
        }
      }
    } else if (isDrawingFreehand) {
      isDrawingRef.current = true;
      const newPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
      setDrawingPaths(prevPaths => [...prevPaths, [newPoint]]);
    }
  };
  const drawFreehandPath = (ctx) => {
    drawingPaths.forEach(path => {
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };
  const drawLivewirePath = (ctx) => {
    ctx.beginPath();
    fixedPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point[0] + x, point[1] + y);
      } else {
        ctx.lineTo(point[0] + x, point[1] + y);
      }
    });
    currentPath.forEach(point => {
      ctx.lineTo(point[0] + x, point[1] + y);
    });
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  const mergeEditingPathWithAnnotation = () => {
    if (editingPath.length > 1 && selectedAnnotation) {
      const editingPathVertices = editingPath.map(point => ({ x: point[0] + x, y: point[1] + y }));
      let newPath;
      if(!subtractPath){
        newPath = modifyPath(selectedAnnotation.vertices, editingPathVertices, false);
      }
      else{
       newPath = modifyPath(selectedAnnotation.vertices, editingPathVertices, true);
      }
      const updatedAnnotation = { ...selectedAnnotation, vertices: newPath};
      updateAnnotation(updatedAnnotation);
      setEditingPath([]);
      setSelectedAnnotation(null);
    }
  };
  
  const handleMouseUp = () => {
    if (isEraserActive && isErasing.current) {
      isErasing.current = false;
      handleErase(erasePoints);
      updateHistory()
      setErasePoints([]);
    }
    if (selectedAnnotation&&!isEraserActive) {
      isDrawingRef.current = false;
      mergeEditingPathWithAnnotation();
      }
    if (isDrawingFreehand && isDrawingRef.current) {
      isDrawingRef.current = false;
      completeFreehandDrawing();
    }
    if (isHybridDrawingActive) {
      setIsMouseDown(false);
      if (livewirePath.length > 0) {
        setHybridPath(prevPath => [...prevPath, ...livewirePath]);
        setLivewirePath([]);
      }
      // Start a new LiveWire search from the last point
      if (lastPointRef.current) {
        livewireRef.current.startSearch(lastPointRef.current);
      }
    }
  };
  useEffect(()=>{
    if(erasePoints.length!==0){
      handleErase(erasePoints);
    }
  },[erasePoints])
  const handleMouseMove = (e) => {
    if (isEraserActive && isErasing.current && selectedAnnotation) {
      const newPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
      setErasePoints(prevPoints => [...prevPoints, newPoint]);
    }
    if (selectedAnnotation && isDrawingRef.current&&!isEraserActive) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentPoint = [
        Math.round(e.clientX - rect.left - x),
        Math.round(e.clientY - rect.top - y)
      ];
      setEditingPath(prevPath => [...prevPath, currentPoint]);
    }
    if (isHybridDrawingActive && isDrawingStartedRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentPoint = [
        Math.round(e.clientX - rect.left - x),
        Math.round(e.clientY - rect.top - y)
      ];

      if (isMouseDown) {
        // Freehand drawing
        setHybridPath(prevPath => [...prevPath, currentPoint]);
        lastPointRef.current = currentPoint;
      } else if (hybridPath.length > 0) {
        // LiveWire
        const path = livewireRef.current.findPathToPoint(currentPoint);
        setLivewirePath(path);
        drawHybridPath([...hybridPath, ...path]);
      }
    }
    if (isLiveWireTracing) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentPoint = [
        Math.round(e.clientX - rect.left - x),
        Math.round(e.clientY - rect.top - y)
      ];
      
      const path = livewireRef.current.findPathToPoint(currentPoint);
      setCurrentPath(path);
    } else if (isDrawingFreehand && isDrawingRef.current) {
      const newPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
      setDrawingPaths(prevPaths => {
        const lastPathIndex = prevPaths.length - 1;
        const updatedLastPath = [...prevPaths[lastPathIndex], newPoint];
        return [...prevPaths.slice(0, lastPathIndex), updatedLastPath];
      });
    }
  };

  const completePolygon = () => {
    setIsLiveWireTracing(false);
    const vertices = [...fixedPoints, ...currentPath].map(point => ({ x: point[0] + x, y: point[1] + y }));
    setNewBoxVertices(vertices);
    setShowDialog(true);
    setIsLiveWireTracingActive(false);
    setFixedPoints([]);
    setCurrentPath([]);
  };

  const completeFreehandDrawing = () => {
    const lastPath = drawingPaths[drawingPaths.length - 1];
    if (lastPath && lastPath.length > 2) {
      const vertices = lastPath.map(point => ({ x: point.x, y: point.y }));
      setNewBoxVertices(vertices);
      setShowDialog(true);
      setDrawingPaths([]);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        cursor: isEraserActive ? eraserCursor : 'default'
      }}
    />
  );
};

export default Canvas;
