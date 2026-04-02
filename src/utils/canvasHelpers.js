import { distance } from '../utils/geometry';

function snapToGrid(value, gridSize) {
    return Math.round(value / gridSize) * gridSize;
}

function snapPointToGrid(point, gridSize) {
    return {
        x: snapToGrid(point.x, gridSize),
        y: snapToGrid(point.y, gridSize),
    };
}

function flatToPoints(flatPoints) {
    const points = [];
    for (let i = 0; i < flatPoints.length; i += 2) {
        points.push({ x: flatPoints[i], y: flatPoints[i + 1] });
    }
    return points;
}

function pointsToFlat(points) {
    return points.flatMap((p) => [p.x, p.y]);
}

function isNearPoint(point, target, threshold) {
    return distance(point, target) <= threshold;
}

export { snapToGrid, snapPointToGrid, flatToPoints, pointsToFlat, isNearPoint };
