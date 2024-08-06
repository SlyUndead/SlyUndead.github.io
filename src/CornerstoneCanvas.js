import React, { useEffect, useRef, useState } from 'react';
import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import loadBase64Image from './customImageLoader';

const CornerstoneCanvas = ({ imageSrc, setAnnotations }) => {
  const canvasRef = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);

  useEffect(() => {
    const initializeCornerstone = async () => {
      // Initialize Cornerstone and tools
      cornerstone.init();
      cornerstoneTools.init();

      const element = canvasRef.current;
      const renderingEngineId = 'myRenderingEngine';
      const viewportId = 'CT_AXIAL_STACK';

      const renderingEngine = new cornerstone.RenderingEngine(renderingEngineId);
      const viewportInput = {
        viewportId,
        element,
        type: cornerstone.Enums.ViewportType.STACK,
      };

      renderingEngine.enableElement(viewportInput);
      const viewport = renderingEngine.getViewport(viewportId);

      const imageId = `base64:${imageSrc}`;
      await loadBase64Image(imageId);
      viewport.setStack([imageId]);
      viewport.render();

      cornerstoneTools.addTool(cornerstoneTools.LivewireContourTool);

      const toolGroup = cornerstoneTools.ToolGroupManager.createToolGroup('myToolGroup');
      toolGroup.addTool(cornerstoneTools.LivewireContourTool.toolName);
      toolGroup.setToolActive(cornerstoneTools.LivewireContourTool.toolName, {
        bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Primary }],
      });
      toolGroup.addViewport(viewportId, renderingEngineId);

      element.addEventListener(cornerstoneTools.Events.ANNOTATION_ADDED, (evt) => {
        const { annotation } = evt.detail;
        if (annotation.metadata.toolName === cornerstoneTools.LivewireContourTool.toolName) {
          const newAnnotation = {
            label: 'LiveWire',
            vertices: annotation.data.points.map(point => ({ x: point[0], y: point[1] })),
          };
          setAnnotations(prevAnnotations => [...prevAnnotations, newAnnotation]);
          setCurrentAnnotation(newAnnotation);
          setIsDialogOpen(true); // Open dialog when annotation is added
        }
      });

      return () => {
        renderingEngine.destroy();
      };
    };

    initializeCornerstone();
  }, [imageSrc, setAnnotations]);

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div
        ref={canvasRef}
        style={{ width: '100%', height: '500px', border: '1px solid #000' }}
      />
      {/* Implement your Dialog component here */}
    </div>
  );
};

export default CornerstoneCanvas;
