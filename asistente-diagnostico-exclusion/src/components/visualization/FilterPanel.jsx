import React from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { DIMENSIONS } from '../../data/dimensions';

// Color palette
const DIMENSION_COLORS = {
    dim1: { primary: '#00A8A8', name: 'Situación Económica y Laboral' },
    dim2: { primary: '#FF6B6B', name: 'Vivienda y Hábitat' },
    dim3: { primary: '#4ECDC4', name: 'Salud y Bienestar Físico' },
    dim4: { primary: '#9B59B6', name: 'Salud Mental y Bienestar Psicológico' },
    dim5: { primary: '#F39C12', name: 'Educación y Competencias' },
    dim6: { primary: '#3498DB', name: 'Relaciones Sociales, Familiares y Comunitarias' },
    dim7: { primary: '#E74C3C', name: 'Participación Ciudadana' },
    dim8: { primary: '#1ABC9C', name: 'Situación Legal y Administrativa' },
};

export function FilterPanel({ filters, onFiltersChange }) {
    const { selectedDimension, selectedSubdimension, showDependencies } = filters;

    const dimensions = Object.entries(DIMENSIONS).map(([id, dim]) => ({
        id,
        title: dim.title,
        color: DIMENSION_COLORS[id]?.primary || '#00A8A8'
    }));

    const subdimensions = selectedDimension
        ? DIMENSIONS[selectedDimension]?.subdimensions.map(sub => ({
            id: sub.id,
            title: sub.title
        })) || []
        : [];

    const clearFilters = () => {
        onFiltersChange({
            selectedDimension: null,
            selectedSubdimension: null,
            showDependencies: false
        });
    };

    const hasActiveFilters = selectedDimension || selectedSubdimension || showDependencies;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-teal-600" />
                    <span className="font-bold text-slate-800">Filtros de Visualización</span>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <X size={14} />
                        Limpiar filtros
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Dimension Filter */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Dimensión
                    </label>
                    <div className="relative">
                        <select
                            value={selectedDimension || ''}
                            onChange={(e) => onFiltersChange({
                                ...filters,
                                selectedDimension: e.target.value || null,
                                selectedSubdimension: null // Reset subdimension when dimension changes
                            })}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
                        >
                            <option value="">Todas las dimensiones</option>
                            {dimensions.map(dim => (
                                <option key={dim.id} value={dim.id}>
                                    {dim.title}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Subdimension Filter */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Subdimensión
                    </label>
                    <div className="relative">
                        <select
                            value={selectedSubdimension || ''}
                            onChange={(e) => onFiltersChange({
                                ...filters,
                                selectedSubdimension: e.target.value || null
                            })}
                            disabled={!selectedDimension}
                            className={`w-full appearance-none border border-slate-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer ${selectedDimension
                                    ? 'bg-slate-50 text-slate-700'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <option value="">
                                {selectedDimension ? 'Todas las subdimensiones' : 'Selecciona dimensión primero'}
                            </option>
                            {subdimensions.map(sub => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.title}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Dependencies Toggle */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Mostrar
                    </label>
                    <button
                        onClick={() => onFiltersChange({
                            ...filters,
                            showDependencies: !showDependencies
                        })}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${showDependencies
                                ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                    >
                        <span className={showDependencies ? 'text-orange-500' : 'text-slate-400'}>⚡</span>
                        {showDependencies ? 'Mostrando dependencias' : 'Mostrar dependencias'}
                    </button>
                </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                        {selectedDimension && (
                            <span
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                                style={{ background: DIMENSION_COLORS[selectedDimension]?.primary }}
                            >
                                {DIMENSION_COLORS[selectedDimension]?.name}
                                <button
                                    onClick={() => onFiltersChange({ ...filters, selectedDimension: null, selectedSubdimension: null })}
                                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                        {selectedSubdimension && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                                {subdimensions.find(s => s.id === selectedSubdimension)?.title}
                                <button
                                    onClick={() => onFiltersChange({ ...filters, selectedSubdimension: null })}
                                    className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                        {showDependencies && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                ⚡ Solo con dependencias
                                <button
                                    onClick={() => onFiltersChange({ ...filters, showDependencies: false })}
                                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default FilterPanel;
