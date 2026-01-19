import React, { useState, useMemo } from 'react';
import {
    Plus, Trash2, Edit3, X, Save, Check, ChevronRight, ChevronDown,
    Zap, Briefcase, Home, Heart, FileCheck, Wrench, Eye, EyeOff,
    Layers, ToggleLeft, ToggleRight, Power, Copy, Search, Filter,
    AlertTriangle, Sparkles, Calendar, Hash
} from 'lucide-react';
import {
    getAllTools, saveTool, deleteTool, toggleToolActive,
    filterDimensionsByTool, countToolItems
} from '../data/toolsService';
import { getDimensionsConfig } from '../data/dimensionsService';

const ICON_OPTIONS = [
    { id: 'FileCheck', icon: FileCheck, label: 'Documento' },
    { id: 'Zap', icon: Zap, label: 'Rápido' },
    { id: 'Briefcase', icon: Briefcase, label: 'Trabajo' },
    { id: 'Home', icon: Home, label: 'Vivienda' },
    { id: 'Heart', icon: Heart, label: 'Salud' },
    { id: 'Wrench', icon: Wrench, label: 'Herramienta' },
    { id: 'Sparkles', icon: Sparkles, label: 'Especial' },
];

const ICON_MAP = {
    FileCheck: FileCheck,
    Zap: Zap,
    Briefcase: Briefcase,
    Home: Home,
    Heart: Heart,
    Wrench: Wrench,
    Sparkles: Sparkles,
};

const COLOR_OPTIONS = [
    { value: '#00A8A8', name: 'Teal' },
    { value: '#03444A', name: 'Midnight' },
    { value: '#E66414', name: 'Naranja' },
    { value: '#FF924D', name: 'Melocotón' },
    { value: '#9AD3DA', name: 'Celeste' },
    { value: '#6366f1', name: 'Índigo' },
    { value: '#ec4899', name: 'Rosa' },
    { value: '#8b5cf6', name: 'Violeta' },
];

export function ToolsManager({ onClose }) {
    const [tools, setTools] = useState(getAllTools);
    const [editingTool, setEditingTool] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
    const dimensions = getDimensionsConfig();

    // Filter and search tools
    const filteredTools = useMemo(() => {
        return tools.filter(tool => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.description?.toLowerCase().includes(searchQuery.toLowerCase());

            // Active filter
            const matchesActive = filterActive === 'all' ||
                (filterActive === 'active' && tool.isActive) ||
                (filterActive === 'inactive' && !tool.isActive);

            return matchesSearch && matchesActive;
        });
    }, [tools, searchQuery, filterActive]);

    const activeCount = tools.filter(t => t.isActive).length;
    const customCount = tools.filter(t => !t.isDefault && !t.isPreset).length;

    const handleToggleActive = (toolId, isActive) => {
        toggleToolActive(toolId, isActive);
        setTools(getAllTools());
    };

    const handleDelete = (toolId) => {
        deleteTool(toolId);
        setTools(getAllTools());
        setDeleteConfirm(null);
    };

    const handleDuplicate = (tool) => {
        const duplicated = {
            ...tool,
            id: `tool_${Date.now()}`,
            name: `${tool.name} (copia)`,
            isDefault: false,
            isPreset: false,
            isActive: false,
            createdAt: new Date().toISOString()
        };
        saveTool(duplicated);
        setTools(getAllTools());
    };

    const handleSaveTool = (tool) => {
        saveTool(tool);
        setTools(getAllTools());
        setEditingTool(null);
        setShowCreateModal(false);
    };

    // Stats cards
    const StatCard = ({ icon: Icon, value, label, color }) => (
        <div className="card text-center p-4">
            <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-lg" style={{ background: `${color}15` }}>
                    <Icon size={20} style={{ color }} />
                </div>
            </div>
            <div className="text-2xl font-black" style={{ color }}>{value}</div>
            <div className="text-xs text-slate-500 font-medium">{label}</div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Herramientas de Diagnóstico</h2>
                    <p className="text-slate-500">
                        Gestiona las herramientas disponibles para crear diagnósticos personalizados.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary"
                >
                    <Plus size={18} />
                    Nueva Herramienta
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Wrench} value={tools.length} label="Total" color="#03444A" />
                <StatCard icon={Power} value={activeCount} label="Activas" color="#00A8A8" />
                <StatCard icon={Sparkles} value={customCount} label="Personalizadas" color="#E66414" />
                <StatCard icon={FileCheck} value={tools.filter(t => t.isPreset).length} label="Plantillas" color="#6366f1" />
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex-1 min-w-[200px] relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar herramientas..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="input pl-10"
                    />
                </div>
                <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                    {[
                        { id: 'all', label: 'Todas' },
                        { id: 'active', label: 'Activas' },
                        { id: 'inactive', label: 'Inactivas' }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setFilterActive(opt.id)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterActive === opt.id
                                    ? 'bg-white shadow-sm text-slate-900'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tools Grid */}
            {filteredTools.length === 0 ? (
                <div className="card text-center py-12">
                    <Search size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">No se encontraron herramientas con los filtros actuales.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {filteredTools.map(tool => {
                        const Icon = ICON_MAP[tool.icon] || FileCheck;
                        const stats = countToolItems(dimensions, tool);

                        return (
                            <div
                                key={tool.id}
                                className={`card transition-all ${tool.isActive ? 'ring-2 shadow-lg' : 'opacity-70'
                                    }`}
                                style={{
                                    borderColor: tool.isActive ? tool.color : '#e2e8f0',
                                    ringColor: tool.color
                                }}
                            >
                                {/* Header with toggle */}
                                <div className="flex items-start justify-between mb-3">
                                    <div
                                        className="p-3 rounded-xl"
                                        style={{ background: `${tool.color}20` }}
                                    >
                                        <Icon size={24} style={{ color: tool.color }} />
                                    </div>

                                    {/* Active Toggle */}
                                    <button
                                        onClick={() => handleToggleActive(tool.id, !tool.isActive)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${tool.isActive
                                                ? 'text-white shadow-md'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                        style={tool.isActive ? { background: tool.color } : {}}
                                        title={tool.isActive ? 'Desactivar herramienta' : 'Activar herramienta'}
                                    >
                                        <Power size={14} />
                                        {tool.isActive ? 'Activa' : 'Inactiva'}
                                    </button>
                                </div>

                                <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900">{tool.name}</h3>
                                        {tool.isDefault && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-teal-100 text-teal-700">
                                                Default
                                            </span>
                                        )}
                                        {tool.isPreset && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-100 text-purple-700">
                                                Preset
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-2">{tool.description}</p>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-4 text-xs mb-4 p-3 rounded-lg bg-slate-50">
                                    <div className="text-center">
                                        <div className="font-bold text-slate-700">{stats.dimensionCount}</div>
                                        <div className="text-slate-400">Dimensiones</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-slate-700">{stats.subdimensionCount}</div>
                                        <div className="text-slate-400">Subdim.</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-slate-700">{stats.indicatorCount}</div>
                                        <div className="text-slate-400">Indicadores</div>
                                    </div>
                                </div>

                                {/* Meta info */}
                                {tool.createdAt && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                                        <Calendar size={12} />
                                        Creado: {new Date(tool.createdAt).toLocaleDateString()}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t border-slate-100">
                                    {/* View/Edit */}
                                    <button
                                        onClick={() => setEditingTool(tool)}
                                        className="btn btn-secondary py-2 px-3 flex-1 text-sm"
                                        title={tool.isDefault || tool.isPreset ? 'Ver detalles' : 'Editar'}
                                    >
                                        {tool.isDefault || tool.isPreset ? <Eye size={14} /> : <Edit3 size={14} />}
                                        {tool.isDefault || tool.isPreset ? 'Ver' : 'Editar'}
                                    </button>

                                    {/* Duplicate */}
                                    <button
                                        onClick={() => handleDuplicate(tool)}
                                        className="btn btn-secondary py-2 px-3 text-sm"
                                        title="Duplicar herramienta"
                                    >
                                        <Copy size={14} />
                                    </button>

                                    {/* Delete (only custom) */}
                                    {!tool.isDefault && !tool.isPreset && (
                                        <button
                                            onClick={() => setDeleteConfirm(tool)}
                                            className="btn btn-secondary py-2 px-3 text-red-500 hover:bg-red-50 text-sm"
                                            title="Eliminar herramienta"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-red-100">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Eliminar Herramienta</h3>
                                <p className="text-sm text-slate-500">Esta acción no se puede deshacer</p>
                            </div>
                        </div>

                        <p className="text-slate-600 mb-6">
                            ¿Estás seguro de eliminar <strong>"{deleteConfirm.name}"</strong>?
                            Los diagnósticos creados con esta herramienta no se verán afectados.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary">
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm.id)}
                                className="btn bg-red-600 text-white hover:bg-red-700"
                            >
                                <Trash2 size={16} />
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingTool) && (
                <ToolEditorModal
                    tool={editingTool}
                    dimensions={dimensions}
                    onSave={handleSaveTool}
                    onClose={() => { setShowCreateModal(false); setEditingTool(null); }}
                    readOnly={editingTool?.isDefault || editingTool?.isPreset}
                />
            )}
        </div>
    );
}

// Tool Editor Modal with full CRUD support
function ToolEditorModal({ tool, dimensions, onSave, onClose, readOnly = false }) {
    const [form, setForm] = useState({
        id: tool?.id || '',
        name: tool?.name || '',
        description: tool?.description || '',
        icon: tool?.icon || 'Wrench',
        color: tool?.color || '#00A8A8',
        isActive: tool?.isActive !== undefined ? tool.isActive : true,
        enabledDimensions: tool?.enabledDimensions || Object.keys(dimensions),
        enabledSubdimensions: tool?.enabledSubdimensions || {},
        disabledIndicators: tool?.disabledIndicators || {}
    });

    const [expandedDims, setExpandedDims] = useState({});
    const [expandedSubs, setExpandedSubs] = useState({});
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'El nombre es obligatorio';
        if (form.name.length > 50) errs.name = 'Máximo 50 caracteres';
        if (form.enabledDimensions.length === 0) errs.dimensions = 'Selecciona al menos una dimensión';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const toggleDimension = (dimId) => {
        if (readOnly) return;
        const enabled = form.enabledDimensions.includes(dimId);
        if (enabled) {
            setForm(f => ({ ...f, enabledDimensions: f.enabledDimensions.filter(d => d !== dimId) }));
        } else {
            setForm(f => ({ ...f, enabledDimensions: [...f.enabledDimensions, dimId] }));
        }
    };

    const toggleAllDimensions = (enable) => {
        if (readOnly) return;
        if (enable) {
            setForm(f => ({ ...f, enabledDimensions: Object.keys(dimensions) }));
        } else {
            setForm(f => ({ ...f, enabledDimensions: [] }));
        }
    };

    const toggleSubdimension = (dimId, subId) => {
        if (readOnly) return;
        setForm(f => {
            const current = f.enabledSubdimensions[dimId] || [];
            const all = dimensions[dimId].subdimensions.map(s => s.id);

            if (current.length === 0) {
                return { ...f, enabledSubdimensions: { ...f.enabledSubdimensions, [dimId]: all.filter(s => s !== subId) } };
            } else if (current.includes(subId)) {
                const newList = current.filter(s => s !== subId);
                return { ...f, enabledSubdimensions: { ...f.enabledSubdimensions, [dimId]: newList.length > 0 ? newList : undefined } };
            } else {
                return { ...f, enabledSubdimensions: { ...f.enabledSubdimensions, [dimId]: [...current, subId] } };
            }
        });
    };

    const toggleIndicator = (indId) => {
        if (readOnly) return;
        setForm(f => {
            const newDisabled = { ...f.disabledIndicators };
            if (newDisabled[indId]) {
                delete newDisabled[indId];
            } else {
                newDisabled[indId] = true;
            }
            return { ...f, disabledIndicators: newDisabled };
        });
    };

    const isSubEnabled = (dimId, subId) => {
        if (!form.enabledDimensions.includes(dimId)) return false;
        const subs = form.enabledSubdimensions[dimId];
        if (!subs) return true;
        return subs.includes(subId);
    };

    const isIndEnabled = (indId) => !form.disabledIndicators[indId];

    const handleSubmit = () => {
        if (readOnly) {
            onClose();
            return;
        }
        if (!validate()) return;
        onSave(form);
    };

    // Count enabled items
    const enabledStats = useMemo(() => {
        let dims = form.enabledDimensions.length;
        let subs = 0;
        let inds = 0;

        form.enabledDimensions.forEach(dimId => {
            const dim = dimensions[dimId];
            if (!dim) return;

            dim.subdimensions.forEach(sub => {
                if (isSubEnabled(dimId, sub.id)) {
                    subs++;
                    sub.indicators.forEach(ind => {
                        if (isIndEnabled(ind.id)) inds++;
                    });
                }
            });
        });

        return { dims, subs, inds };
    }, [form, dimensions]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100" style={{ background: `linear-gradient(135deg, ${form.color}10 0%, white 100%)` }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {readOnly ? 'Ver Herramienta' : tool ? 'Editar Herramienta' : 'Nueva Herramienta'}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {readOnly
                                    ? 'Visualizando configuración (solo lectura)'
                                    : 'Configura las dimensiones e indicadores incluidos'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Nombre *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                className={`input ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
                                placeholder="Ej: Triaje Rápido"
                                disabled={readOnly}
                                maxLength={50}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="label">Icono</label>
                            <div className="flex gap-2 flex-wrap">
                                {ICON_OPTIONS.map(opt => {
                                    const Icon = opt.icon;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => !readOnly && setForm(f => ({ ...f, icon: opt.id }))}
                                            className={`p-2.5 rounded-lg border-2 transition-all ${form.icon === opt.id
                                                    ? 'border-slate-400 bg-slate-100'
                                                    : 'border-transparent hover:bg-slate-50'
                                                }`}
                                            title={opt.label}
                                            disabled={readOnly}
                                        >
                                            <Icon size={18} className="text-slate-600" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Descripción</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                className="input resize-none"
                                rows={2}
                                placeholder="Breve descripción de esta herramienta..."
                                disabled={readOnly}
                                maxLength={200}
                            />
                        </div>
                        <div>
                            <label className="label">Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {COLOR_OPTIONS.map(c => (
                                    <button
                                        key={c.value}
                                        onClick={() => !readOnly && setForm(f => ({ ...f, color: c.value }))}
                                        className={`w-8 h-8 rounded-lg transition-all ${form.color === c.value ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'
                                            }`}
                                        style={{ background: c.value, ringColor: c.value }}
                                        title={c.name}
                                        disabled={readOnly}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Active toggle */}
                    {!readOnly && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                            <button
                                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                                className="flex items-center gap-2"
                            >
                                {form.isActive ? (
                                    <ToggleRight size={28} style={{ color: form.color }} />
                                ) : (
                                    <ToggleLeft size={28} className="text-slate-300" />
                                )}
                            </button>
                            <div>
                                <p className="font-semibold text-slate-900">Disponible para crear diagnósticos</p>
                                <p className="text-sm text-slate-500">
                                    {form.isActive
                                        ? 'Esta herramienta aparecerá en el selector'
                                        : 'Esta herramienta estará oculta'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Summary stats */}
                    <div className="flex items-center gap-6 p-4 rounded-xl border-2" style={{ borderColor: form.color + '40', background: form.color + '08' }}>
                        <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: form.color }}>{enabledStats.dims}</div>
                            <div className="text-xs text-slate-500">Dimensiones</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: form.color }}>{enabledStats.subs}</div>
                            <div className="text-xs text-slate-500">Subdimensiones</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: form.color }}>{enabledStats.inds}</div>
                            <div className="text-xs text-slate-500">Indicadores</div>
                        </div>
                        <div className="flex-1" />
                        {!readOnly && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleAllDimensions(true)}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600"
                                >
                                    Seleccionar todo
                                </button>
                                <button
                                    onClick={() => toggleAllDimensions(false)}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600"
                                >
                                    Limpiar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Dimensions Tree */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <Layers size={16} />
                            Configurar Dimensiones e Indicadores
                        </label>
                        {errors.dimensions && <p className="text-red-500 text-xs mb-2">{errors.dimensions}</p>}

                        <div className="space-y-2 max-h-[350px] overflow-y-auto border border-slate-200 rounded-xl p-3">
                            {Object.values(dimensions).map(dim => {
                                const isDimEnabled = form.enabledDimensions.includes(dim.id);
                                const isExpanded = expandedDims[dim.id];
                                const enabledSubCount = dim.subdimensions.filter(s => isSubEnabled(dim.id, s.id)).length;

                                return (
                                    <div key={dim.id} className={`border rounded-lg overflow-hidden transition-all ${isDimEnabled ? 'border-slate-200' : 'border-slate-100 bg-slate-50/50'
                                        }`}>
                                        {/* Dimension Header */}
                                        <div className="flex items-center gap-2 p-3 bg-white">
                                            <button
                                                onClick={() => setExpandedDims(p => ({ ...p, [dim.id]: !p[dim.id] }))}
                                                className="p-1 rounded hover:bg-slate-100"
                                                disabled={!isDimEnabled}
                                            >
                                                {isExpanded && isDimEnabled ? <ChevronDown size={16} /> : <ChevronRight size={16} className={!isDimEnabled ? 'text-slate-300' : ''} />}
                                            </button>
                                            <label className="flex items-center gap-3 flex-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isDimEnabled}
                                                    onChange={() => toggleDimension(dim.id)}
                                                    className="w-5 h-5 rounded"
                                                    style={{ accentColor: form.color }}
                                                    disabled={readOnly}
                                                />
                                                <span className={`font-semibold ${isDimEnabled ? 'text-slate-900' : 'text-slate-400'}`}>
                                                    {dim.title}
                                                </span>
                                            </label>
                                            <span className="text-xs text-slate-400">
                                                {enabledSubCount}/{dim.subdimensions.length} subdim.
                                            </span>
                                        </div>

                                        {/* Subdimensions */}
                                        {isExpanded && isDimEnabled && (
                                            <div className="pl-8 pb-2 bg-slate-50/50">
                                                {dim.subdimensions.map(sub => {
                                                    const isSubExp = expandedSubs[sub.id];
                                                    const subEnabled = isSubEnabled(dim.id, sub.id);
                                                    const enabledIndCount = sub.indicators.filter(i => isIndEnabled(i.id)).length;

                                                    return (
                                                        <div key={sub.id} className="border-l-2 border-slate-200 ml-2">
                                                            <div className="flex items-center gap-2 p-2">
                                                                <button
                                                                    onClick={() => setExpandedSubs(p => ({ ...p, [sub.id]: !p[sub.id] }))}
                                                                    className="p-1 rounded hover:bg-slate-100"
                                                                    disabled={!subEnabled}
                                                                >
                                                                    {isSubExp && subEnabled ? <ChevronDown size={14} /> : <ChevronRight size={14} className={!subEnabled ? 'text-slate-300' : ''} />}
                                                                </button>
                                                                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={subEnabled}
                                                                        onChange={() => toggleSubdimension(dim.id, sub.id)}
                                                                        className="w-4 h-4 rounded"
                                                                        style={{ accentColor: form.color }}
                                                                        disabled={readOnly}
                                                                    />
                                                                    <span className={`text-sm ${subEnabled ? 'text-slate-700' : 'text-slate-400'}`}>
                                                                        {sub.title}
                                                                    </span>
                                                                </label>
                                                                <span className="text-xs text-slate-400">
                                                                    {enabledIndCount}/{sub.indicators.length} ind.
                                                                </span>
                                                            </div>

                                                            {/* Indicators */}
                                                            {isSubExp && subEnabled && (
                                                                <div className="pl-8 pb-2 space-y-1">
                                                                    {sub.indicators.map(ind => (
                                                                        <label key={ind.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isIndEnabled(ind.id)}
                                                                                onChange={() => toggleIndicator(ind.id)}
                                                                                className="w-4 h-4 rounded"
                                                                                style={{ accentColor: form.color }}
                                                                                disabled={readOnly}
                                                                            />
                                                                            <span className={`text-sm ${isIndEnabled(ind.id) ? 'text-slate-600' : 'text-slate-400 line-through'}`}>
                                                                                {ind.label}
                                                                            </span>
                                                                            {ind.dependsOn && (
                                                                                <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">dep</span>
                                                                            )}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="btn btn-secondary">
                        {readOnly ? 'Cerrar' : 'Cancelar'}
                    </button>
                    {!readOnly && (
                        <button onClick={handleSubmit} className="btn btn-primary">
                            <Save size={18} />
                            {tool ? 'Guardar Cambios' : 'Crear Herramienta'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
