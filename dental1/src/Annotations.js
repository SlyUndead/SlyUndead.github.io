// // Annotations.js
import { labelColors } from './constants';

export const getBoxDimensions = (vertices) => {
  const xCoords = vertices.map(v => v.x);
  const yCoords = vertices.map(v => v.y);
  const left = Math.min(...xCoords);
  const top = Math.min(...yCoords);
  const width = Math.max(...xCoords) - left;
  const height = Math.max(...yCoords) - top;
  return { left, top, width, height };
};

export const drawAnnotations = (ctx, annotations, hiddenAnnotations, hoveredAnnotation, image, x, y, scale,selectedAnnotation) => {
  annotations.forEach((anno, index) => {
    if (!hiddenAnnotations.includes(index)) {
      const { left, top } = getBoxDimensions(anno.vertices);
      
      // Start a new path for each annotation
      ctx.beginPath();
      
      // Move to the first vertex
      ctx.moveTo(anno.vertices[0].x, anno.vertices[0].y);
      
      // Draw lines to each subsequent vertex
      for (let i = 1; i < anno.vertices.length; i++) {
        ctx.lineTo(anno.vertices[i].x, anno.vertices[i].y);
      }
      
      // Close the path
      ctx.closePath();
      
      // Fill the polygon if it's hovered
      if (index === hoveredAnnotation) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      }
      
      // Stroke the polygon
      ctx.strokeStyle = labelColors[anno.label] || 'black';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw the label
      if(selectedAnnotation!==anno){ctx.fillStyle = labelColors[anno.label];
      const labelWidth = ctx.measureText(anno.label).width + 15;
      const labelHeight = 20;
      ctx.fillRect(left, top - labelHeight, labelWidth, labelHeight);

      ctx.fillStyle = 'white';
      ctx.fillText(anno.label, left + 5, top - 5);}
    }
  });
};