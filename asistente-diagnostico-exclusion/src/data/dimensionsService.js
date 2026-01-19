/**
 * Service for managing dimensions configuration
 * Handles CRUD operations for indicators with local storage persistence
 */

import { DIMENSIONS as DEFAULT_DIMENSIONS } from './dimensions';

const STORAGE_KEY = 'asistente_dx_dimensions_config';

/**
 * Get the current dimensions configuration (from localStorage or default)
 */
export function getDimensionsConfig() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Error loading dimensions config:', e);
    }
    return structuredClone(DEFAULT_DIMENSIONS);
}

/**
 * Save dimensions configuration to localStorage
 */
export function saveDimensionsConfig(config) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        return true;
    } catch (e) {
        console.error('Error saving dimensions config:', e);
        return false;
    }
}

/**
 * Reset dimensions configuration to default
 */
export function resetDimensionsConfig() {
    localStorage.removeItem(STORAGE_KEY);
    return structuredClone(DEFAULT_DIMENSIONS);
}

/**
 * Update a single indicator
 */
export function updateIndicator(config, dimId, subId, indicatorId, updates) {
    const newConfig = structuredClone(config);
    const dim = newConfig[dimId];
    if (!dim) return config;

    const sub = dim.subdimensions.find(s => s.id === subId);
    if (!sub) return config;

    const indIndex = sub.indicators.findIndex(i => i.id === indicatorId);
    if (indIndex === -1) return config;

    sub.indicators[indIndex] = { ...sub.indicators[indIndex], ...updates };
    saveDimensionsConfig(newConfig);
    return newConfig;
}

/**
 * Move an indicator to a different subdimension
 */
export function moveIndicator(config, fromDimId, fromSubId, indicatorId, toDimId, toSubId) {
    const newConfig = structuredClone(config);

    // Find source subdimension
    const fromDim = newConfig[fromDimId];
    if (!fromDim) return config;
    const fromSub = fromDim.subdimensions.find(s => s.id === fromSubId);
    if (!fromSub) return config;

    // Find and remove indicator from source
    const indIndex = fromSub.indicators.findIndex(i => i.id === indicatorId);
    if (indIndex === -1) return config;
    const [indicator] = fromSub.indicators.splice(indIndex, 1);

    // Find target subdimension
    const toDim = newConfig[toDimId];
    if (!toDim) return config;
    const toSub = toDim.subdimensions.find(s => s.id === toSubId);
    if (!toSub) return config;

    // Add indicator to target (at the end)
    toSub.indicators.push(indicator);

    saveDimensionsConfig(newConfig);
    return newConfig;
}

/**
 * Delete an indicator
 */
export function deleteIndicator(config, dimId, subId, indicatorId) {
    const newConfig = structuredClone(config);
    const dim = newConfig[dimId];
    if (!dim) return config;

    const sub = dim.subdimensions.find(s => s.id === subId);
    if (!sub) return config;

    sub.indicators = sub.indicators.filter(i => i.id !== indicatorId);
    saveDimensionsConfig(newConfig);
    return newConfig;
}

/**
 * Add a new indicator
 */
export function addIndicator(config, dimId, subId, indicator) {
    const newConfig = structuredClone(config);
    const dim = newConfig[dimId];
    if (!dim) return config;

    const sub = dim.subdimensions.find(s => s.id === subId);
    if (!sub) return config;

    // Generate unique ID
    const newId = `ind_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    sub.indicators.push({ ...indicator, id: newId });

    saveDimensionsConfig(newConfig);
    return newConfig;
}

/**
 * Duplicate an indicator
 */
export function duplicateIndicator(config, dimId, subId, indicatorId) {
    const newConfig = structuredClone(config);
    const dim = newConfig[dimId];
    if (!dim) return config;

    const sub = dim.subdimensions.find(s => s.id === subId);
    if (!sub) return config;

    const indicator = sub.indicators.find(i => i.id === indicatorId);
    if (!indicator) return config;

    const newId = `ind_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const duplicate = {
        ...structuredClone(indicator),
        id: newId,
        label: indicator.label + ' (copia)'
    };
    delete duplicate.dependsOn; // Remove dependency from copy

    // Insert after original
    const indIndex = sub.indicators.findIndex(i => i.id === indicatorId);
    sub.indicators.splice(indIndex + 1, 0, duplicate);

    saveDimensionsConfig(newConfig);
    return newConfig;
}

/**
 * Reorder indicators within a subdimension
 */
export function reorderIndicators(config, dimId, subId, fromIndex, toIndex) {
    const newConfig = structuredClone(config);
    const dim = newConfig[dimId];
    if (!dim) return config;

    const sub = dim.subdimensions.find(s => s.id === subId);
    if (!sub) return config;

    const [removed] = sub.indicators.splice(fromIndex, 1);
    sub.indicators.splice(toIndex, 0, removed);

    saveDimensionsConfig(newConfig);
    return newConfig;
}

/**
 * Get all subdimensions across all dimensions (for move dropdown)
 */
export function getAllSubdimensions(config) {
    const result = [];
    Object.values(config).forEach(dim => {
        dim.subdimensions.forEach(sub => {
            result.push({
                dimId: dim.id,
                dimTitle: dim.title,
                subId: sub.id,
                subTitle: sub.title,
                fullLabel: `${dim.title} → ${sub.title}`
            });
        });
    });
    return result;
}

/**
 * Get all indicators in a dimension (for dependency dropdown)
 */
export function getDimensionIndicators(config, dimId) {
    const dim = config[dimId];
    if (!dim) return [];

    const result = [];
    dim.subdimensions.forEach(sub => {
        sub.indicators.forEach(ind => {
            result.push({
                id: ind.id,
                label: ind.label,
                subTitle: sub.title,
                type: ind.type,
                options: ind.options
            });
        });
    });
    return result;
}
