// src/utils/shapeRecognizer.js

function pointLineDistance(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.abs(dy * point.x - dx * point.y + end.x * start.y - end.y * start.x) / Math.hypot(dx, dy);
  return isNaN(dist) ? 0 : dist;
}

export function rdpSimplify(points, epsilon) {
  if (points.length < 3) return points;
  let dmax = 0;
  let index = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = pointLineDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }
  if (dmax > epsilon) {
    const left = rdpSimplify(points.slice(0, index + 1), epsilon);
    const right = rdpSimplify(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  } else {
    return [points[0], points[end]];
  }
}

export const recognizeShape = (points) => {
  if (points.length < 5) return null;

  const start = points[0];
  const end = points[points.length - 1];

  // Bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  points.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });

  const width = maxX - minX;
  const height = maxY - minY;
  const diagonal = Math.hypot(width, height);
  if (diagonal < 20) return null; // Too small

  const cx = minX + width / 2;
  const cy = minY + height / 2;

  // Dynamic RDP Simplification
  const epsilon = diagonal * 0.08;
  const simplified = rdpSimplify(points, epsilon);

  // Closed loop check
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy);
  const isClosed = dist < (diagonal * 0.2) || dist < 40;

  if (isClosed) {
    let V = simplified;
    if (V.length > 2) {
      const closingDist = Math.hypot(V[0].x - V[V.length - 1].x, V[0].y - V[V.length - 1].y);
      if (closingDist < diagonal * 0.25) {
        V = V.slice(0, -1);
      }
    }

    // Triangle
    if (V.length === 3) {
      return { type: 'polygon', points: V };
    }

    // Square vs Rectangle vs Diamond
    if (V.length === 4) {
      const ratio = Math.min(width, height) / Math.max(width, height);
      
      // Orthogonal check
      let orthogonalCount = 0;
      const edgeThreshold = diagonal * 0.15;
      points.forEach(p => {
        if (Math.abs(p.x - minX) < edgeThreshold || Math.abs(p.x - maxX) < edgeThreshold || 
            Math.abs(p.y - minY) < edgeThreshold || Math.abs(p.y - maxY) < edgeThreshold) {
          orthogonalCount++;
        }
      });
      const isOrthogonal = orthogonalCount / points.length > 0.75;

      if (isOrthogonal) {
        if (ratio > 0.82) {
          const size = Math.max(width, height);
          return { type: 'rectangle', x: cx - size / 2, y: cy - size / 2, w: size, h: size, isSquare: true };
        } else {
          return { type: 'rectangle', x: minX, y: minY, w: width, h: height };
        }
      } else {
        // Diamond
        const diamondPoints = [
          { x: cx, y: minY },
          { x: maxX, y: cy },
          { x: cx, y: maxY },
          { x: minX, y: cy }
        ];
        return { type: 'polygon', points: diamondPoints };
      }
    }

    // Curved Loops -> Circle vs Ellipse
    const ratio = Math.min(width, height) / Math.max(width, height);
    if (ratio > 0.85) {
      const radii = points.map(p => Math.hypot(p.x - cx, p.y - cy));
      const avgRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
      let variance = 0;
      radii.forEach(r => variance += Math.pow(r - avgRadius, 2));
      variance /= radii.length;
      if (Math.sqrt(variance) / avgRadius < 0.20) {
        return { type: 'circle', cx, cy, r: avgRadius };
      }
    }
    
    // Fallback to ellipse for all other closed smooth loops
    if (V.length > 4) {
      return { type: 'ellipse', cx, cy, rx: width / 2, ry: height / 2 };
    }
  } else {
    // Line Check
    if (simplified.length === 2) {
      return { type: 'line', x1: start.x, y1: start.y, x2: end.x, y2: end.y };
    }
  }

  return null;
};
