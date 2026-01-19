/**
 * Service for managing Diagnostic Tools (templates)
 * Allows creating custom diagnostic configurations by enabling/disabling dimensions, subdimensions, and indicators
 */

const TOOLS_STORAGE_KEY = 'asistente_dx_tools';
const ACTIVE_TOOLS_KEY = 'asistente_dx_active_tools'; // Now stores array of active tool IDs

// Default tool that includes everything
const DEFAULT_TOOL = {
    id: 'complete',
    name: 'Diagnóstico Completo',
    description: 'Herramienta de diagnóstico integral con todas las dimensiones e indicadores.',
    icon: 'FileCheck',
    color: '#00A8A8',
    isDefault: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    enabledDimensions: ['dim1', 'dim2', 'dim3', 'dim4', 'dim5', 'dim6', 'dim7', 'dim8'],
    enabledSubdimensions: {},
    disabledIndicators: {}
};

// Preset templates
const PRESET_TOOLS = [
    {
        id: 'triage',
        name: 'Triaje Rápido',
        description: 'Evaluación rápida para identificar necesidades urgentes. Solo indicadores críticos.',
        icon: 'Zap',
        color: '#E66414',
        isPreset: true,
        isActive: true,
        enabledDimensions: ['dim1', 'dim2', 'dim3', 'dim4'],
        enabledSubdimensions: {
            dim1: ['sub1_1'],
            dim2: ['sub2_1'],
            dim3: ['sub3_1'],
            dim4: ['sub4_1']
        },
        disabledIndicators: {}
    },
    {
        id: 'laboral',
        name: 'Situación Laboral',
        description: 'Evaluación enfocada en la situación económica y laboral.',
        icon: 'Briefcase',
        color: '#03444A',
        isPreset: true,
        isActive: false,
        enabledDimensions: ['dim1', 'dim5'],
        enabledSubdimensions: {},
        disabledIndicators: {}
    },
    {
        id: 'vivienda',
        name: 'Situación de Vivienda',
        description: 'Evaluación enfocada en vivienda y hábitat.',
        icon: 'Home',
        color: '#00A8A8',
        isPreset: true,
        isActive: false,
        enabledDimensions: ['dim2'],
        enabledSubdimensions: {},
        disabledIndicators: {}
    },
    {
        id: 'salud',
        name: 'Salud Integral',
        description: 'Evaluación de salud física y mental.',
        icon: 'Heart',
        color: '#FF924D',
        isPreset: true,
        isActive: false,
        enabledDimensions: ['dim3', 'dim4'],
        enabledSubdimensions: {},
        disabledIndicators: {}
    }
];

/**
 * Get active tool IDs from storage
 */
function getActiveToolIds() {
    try {
        const stored = localStorage.getItem(ACTIVE_TOOLS_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.warn('Error loading active tools:', e);
    }
    // Default: complete and triage are active
    return ['complete', 'triage'];
}

/**
 * Save active tool IDs to storage
 */
function saveActiveToolIds(ids) {
    localStorage.setItem(ACTIVE_TOOLS_KEY, JSON.stringify(ids));
}

/**
 * Get all diagnostic tools (default + presets + custom) with active state
 */
export function getAllTools() {
    const customTools = getCustomTools();
    const activeIds = getActiveToolIds();

    const allTools = [DEFAULT_TOOL, ...PRESET_TOOLS, ...customTools];

    // Apply active state from storage
    return allTools.map(tool => ({
        ...tool,
        isActive: activeIds.includes(tool.id)
    }));
}

/**
 * Get only active tools (available for creating diagnoses)
 */
export function getActiveTools() {
    return getAllTools().filter(t => t.isActive);
}

/**
 * Get custom tools from storage
 */
export function getCustomTools() {
    try {
        const stored = localStorage.getItem(TOOLS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.warn('Error loading tools:', e);
        return [];
    }
}

/**
 * Toggle tool active state
 */
export function toggleToolActive(toolId, isActive) {
    let activeIds = getActiveToolIds();

    if (isActive) {
        if (!activeIds.includes(toolId)) {
            activeIds.push(toolId);
        }
    } else {
        activeIds = activeIds.filter(id => id !== toolId);
    }

    saveActiveToolIds(activeIds);
    return getAllTools();
}

/**
 * Get a specific tool by ID
 */
export function getToolById(toolId) {
    return getAllTools().find(t => t.id === toolId) || DEFAULT_TOOL;
}

/**
 * Save a custom tool
 */
export function saveTool(tool) {
    const customTools = getCustomTools();
    const existingIndex = customTools.findIndex(t => t.id === tool.id);

    const toolData = {
        ...tool,
        id: tool.id || `tool_${Date.now()}`,
        isActive: tool.isActive !== undefined ? tool.isActive : true
    };

    if (existingIndex >= 0) {
        customTools[existingIndex] = { ...toolData, updatedAt: new Date().toISOString() };
    } else {
        customTools.push({ ...toolData, createdAt: new Date().toISOString() });
    }

    localStorage.setItem(TOOLS_STORAGE_KEY, JSON.stringify(customTools));

    // Also update active tools if needed
    if (toolData.isActive) {
        const activeIds = getActiveToolIds();
        if (!activeIds.includes(toolData.id)) {
            saveActiveToolIds([...activeIds, toolData.id]);
        }
    }

    return customTools;
}

/**
 * Delete a custom tool
 */
export function deleteTool(toolId) {
    const customTools = getCustomTools().filter(t => t.id !== toolId);
    localStorage.setItem(TOOLS_STORAGE_KEY, JSON.stringify(customTools));

    // Also remove from active tools
    const activeIds = getActiveToolIds().filter(id => id !== toolId);
    saveActiveToolIds(activeIds);

    return customTools;
}

/**
 * Check if a dimension is enabled in a tool
 */
export function isDimensionEnabled(tool, dimId) {
    if (!tool || tool.id === 'complete') return true;
    return tool.enabledDimensions?.includes(dimId) ?? true;
}

/**
 * Check if a subdimension is enabled in a tool
 */
export function isSubdimensionEnabled(tool, dimId, subId) {
    if (!tool || tool.id === 'complete') return true;
    if (!isDimensionEnabled(tool, dimId)) return false;

    if (!tool.enabledSubdimensions?.[dimId]) return true;

    return tool.enabledSubdimensions[dimId].includes(subId);
}

/**
 * Check if an indicator is enabled in a tool
 */
export function isIndicatorEnabled(tool, indId) {
    if (!tool || tool.id === 'complete') return true;
    return !(tool.disabledIndicators?.[indId]);
}

/**
 * Filter dimensions based on a tool configuration
 */
export function filterDimensionsByTool(dimensions, tool) {
    if (!tool || tool.id === 'complete') return dimensions;

    const filtered = {};

    Object.keys(dimensions).forEach(dimId => {
        if (!isDimensionEnabled(tool, dimId)) return;

        const dim = dimensions[dimId];
        const filteredSubdims = dim.subdimensions.filter(sub =>
            isSubdimensionEnabled(tool, dimId, sub.id)
        ).map(sub => ({
            ...sub,
            indicators: sub.indicators.filter(ind => isIndicatorEnabled(tool, ind.id))
        })).filter(sub => sub.indicators.length > 0);

        if (filteredSubdims.length > 0) {
            filtered[dimId] = {
                ...dim,
                subdimensions: filteredSubdims
            };
        }
    });

    return filtered;
}

/**
 * Count enabled items in a tool
 */
export function countToolItems(dimensions, tool) {
    const filtered = filterDimensionsByTool(dimensions, tool);

    let dimensionCount = Object.keys(filtered).length;
    let subdimensionCount = 0;
    let indicatorCount = 0;

    Object.values(filtered).forEach(dim => {
        subdimensionCount += dim.subdimensions.length;
        dim.subdimensions.forEach(sub => {
            indicatorCount += sub.indicators.length;
        });
    });

    return { dimensionCount, subdimensionCount, indicatorCount };
}
