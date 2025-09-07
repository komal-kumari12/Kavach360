/**
 * Geospatial Utility Functions
 * Provides helper functions for geospatial calculations
 */

/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param {Array} point1 - [longitude, latitude] of first point
 * @param {Array} point2 - [longitude, latitude] of second point
 * @returns {Number} - Distance in meters
 */
exports.getDistance = (point1, point2) => {
    const [lon1, lat1] = point1;
    const [lon2, lat2] = point2;
    
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
};

/**
 * Check if a point is inside a polygon
 * @param {Array} point - [longitude, latitude] of the point
 * @param {Array} polygon - Array of [longitude, latitude] points forming the polygon
 * @returns {Boolean} - True if point is inside polygon
 */
exports.isPointInPolygon = (point, polygon) => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        
        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

/**
 * Check if a point is inside a circle
 * @param {Array} point - [longitude, latitude] of the point
 * @param {Array} center - [longitude, latitude] of the circle center
 * @param {Number} radius - Radius of the circle in meters
 * @returns {Boolean} - True if point is inside circle
 */
exports.isPointInCircle = (point, center, radius) => {
    const distance = exports.getDistance(point, center);
    return distance <= radius;
};

/**
 * Check if a point is inside a rectangle
 * @param {Array} point - [longitude, latitude] of the point
 * @param {Array} northEast - [longitude, latitude] of the northeast corner
 * @param {Array} southWest - [longitude, latitude] of the southwest corner
 * @returns {Boolean} - True if point is inside rectangle
 */
exports.isPointInRectangle = (point, northEast, southWest) => {
    const [x, y] = point;
    const [xNE, yNE] = northEast;
    const [xSW, ySW] = southWest;
    
    return x >= xSW && x <= xNE && y >= ySW && y <= yNE;
};

/**
 * Calculate the center point of a polygon
 * @param {Array} polygon - Array of [longitude, latitude] points forming the polygon
 * @returns {Array} - [longitude, latitude] of the center point
 */
exports.getPolygonCenter = (polygon) => {
    let x = 0;
    let y = 0;
    
    for (const point of polygon) {
        x += point[0];
        y += point[1];
    }
    
    return [x / polygon.length, y / polygon.length];
};