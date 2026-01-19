import React, { useState, useMemo } from 'react';
import {
    Plus, Trash2, Edit3, X, Save, Check, ChevronRight, ChevronDown,
    Zap, Briefcase, Home, Heart, FileCheck, Wrench, Eye, EyeOff,
    Layers, ToggleLeft, ToggleRight, Power
} from 'lucide-react';
import {
    getAllTools, saveTool, deleteTool, toggleToolActive,
    filterDimensionsByTool, countToolItems
} from '../data/toolsService';
import { getDimensionsConfig } from '../data/dimensionsService';

const ICON_MAP = {
    FileCheck: FileCheck,
    Zap: Zap,
    Briefcase: Briefcase,
    Home: Home,
    Heart: Heart,
    Wrench: Wrench
};

export function ToolsManager({ onClose }) {
    const [tools, setTools] = useState(getAllTools);
    const [editingTool, setEditingTool] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const dimensions = getDimensionsConfig();

    const activeCount = tools.filter(t => t.isActive).length;

    const handleToggleActive = (toolId, isActive) => {
        toggleToolActive(toolId, isActive);
        setTools(getAllTools());
    };

    const handleDelete = (toolId) => {
        if (confirm('¿Está seguro de eliminar esta herramienta?')) {
            deleteTool(toolId);
            setTools(getAllTools());
        }
    };

    const handleSaveTool = (tool) => {
        saveTool(tool);
        setTools(getAllTools());
        setEditingTool(null);
        setShowCreateModal(false);
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Herramientas de Diagnóstico</h2>
                    <p className="text-slate-500">
                        Activa las herramientas que estarán disponibles al crear un diagnóstico.
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: 'rgba(0, 168, 168, 0.15)', color: '#03444A' }}>
                            {activeCount} activas
                        </span>
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

            {/* Tools Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {tools.map(tool => {
                    const Icon = ICON_MAP[tool.icon] || FileCheck;
                    const stats = countToolItems(dimensions, tool);

                    return (
                        <div
                            key={tool.id}
                            className={`card transition-all ${tool.isActive ? 'ring-2 shadow-lg' : 'opacity-60'
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
                                >
                                    <Power size={14} />
                                    {tool.isActive ? 'Activa' : 'Inactiva'}
                                </button>
                            </div>

                            <div className="mb-3">
                                <h3 className="font-bold text-slate-900 mb-1">{tool.name}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2">{tool.description}</p>
                            </div>

                            <div className="flex gap-3 text-xs text-slate-400 mb-4">
                                <span>{stats.dimensionCount} dim.</span>
                                <span>{stats.subdimensionCount} subdim.</span>
                                <span>{stats.indicatorCount} ind.</span>
                            </div>

                            {/* Actions */}
                            {!tool.isDefault && !tool.isPreset && (
                                <div className="flex gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        onClick={() => setEditingTool(tool)}
                                        className="btn btn-secondary py-2 px-3 flex-1"
                                    >
                                        <Edit3 size={14} />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tool.id)}
                                        className="btn btn-secondary py-2 px-3 text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}

                            {(tool.isDefault || tool.isPreset) && (
                                <div className="pt-3 border-t border-slate-100">
                                    <span className="text-xs text-slate-400 italic">
                                        {tool.isDefault ? '⭐ Herramienta por defecto' : '📋 Plantilla predefinida'}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingTool) && (
                <ToolEditorModal
                    tool={editingTool}
                    dimensions={dimensions}
                    onSave={handleSaveTool}
                    onClose={() => { setShowCreateModal(false); setEditingTool(null); }}
                />
            )}
        </div>
    );
}

// Tool Editor Modal
function ToolEditorModal({ tool, dimensions, onSave, onClose }) {
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

    const toggleDimension = (dimId) => {
        const enabled = form.enabledDimensions.includes(dimId);
        if (enabled) {
            setForm(f => ({ ...f, enabledDimensions: f.enabledDimensions.filter(d => d !== dimId) }));
        } else {
            setForm(f => ({ ...f, enabledDimensions: [...f.enabledDimensions, dimId] }));
        }
    };

    const toggleSubdimension = (dimId, subId) => {
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
        if (!form.name.trim()) return;
        onSave(form);
    };

    const colors = ['#00A8A8', '#03444A', '#E66414', '#FF924D', '#9AD3DA'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100" style={{ background: `linear-gradient(135deg, ${form.color}10 0%, white 100%)` }}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900">
                            {tool ? 'Editar Herramienta' : 'Nueva Herramienta de Diagnóstico'}
                        </h3>
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
                            <label className="label">Nombre</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                className="input"
                                placeholder="Ej: Triaje Rápido"
                            />
                        </div>
                        <div>
                            <label className="label">Color</label>
                            <div className="flex gap-2">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setForm(f => ({ ...f, color: c }))}
                                        className={`w-10 h-10 rounded-xl transition-all ${form.color === c ? 'ring-2 ring-offset-2' : ''}`}
                                        style={{ background: c, ringColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="label">Descripción</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="input resize-none"
                            rows={2}
                            placeholder="Breve descripción de esta herramienta..."
                        />
                    </div>

                    {/* Active on create toggle */}
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
                            <p className="font-semibold text-slate-900">Disponible al crear diagnósticos</p>
                            <p className="text-sm text-slate-500">
                                {form.isActive
                                    ? 'Esta herramienta aparecerá en el selector al crear un nuevo diagnóstico'
                                    : 'Esta herramienta estará oculta y no podrá seleccionarse'}
                            </p>
                        </div>
                    </div>

                    {/* Dimensions/Subdimensions/Indicators Tree */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <Layers size={16} />
                            Configurar Dimensiones e Indicadores
                        </label>
                        <p className="text-sm text-slate-500 mb-4">
                            Activa o desactiva las dimensiones, subdimensiones e indicadores que quieres incluir
                        </p>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto border border-slate-200 rounded-xl p-3">
                            {Object.values(dimensions).map(dim => {
                                const isDimEnabled = form.enabledDimensions.includes(dim.id);
                                const isExpanded = expandedDims[dim.id];

                                return (
                                    <div key={dim.id} className="border border-slate-100 rounded-lg overflow-hidden">
                                        {/* Dimension Header */}
                                        <div className="flex items-center gap-2 p-3 bg-slate-50">
                                            <button
                                                onClick={() => setExpandedDims(p => ({ ...p, [dim.id]: !p[dim.id] }))}
                                                className="p-1 rounded hover:bg-slate-200"
                                            >
                                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </button>
                                            <label className="flex items-center gap-3 flex-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isDimEnabled}
                                                    onChange={() => toggleDimension(dim.id)}
                                                    className="w-5 h-5 rounded"
                                                    style={{ accentColor: form.color }}
                                                />
                                                <span className="font-semibold text-slate-900">{dim.title}</span>
                                            </label>
                                            <span className="text-xs text-slate-400">
                                                {dim.subdimensions.length} subdim.
                                            </span>
                                        </div>

                                        {/* Subdimensions */}
                                        {isExpanded && isDimEnabled && (
                                            <div className="pl-8 pb-2">
                                                {dim.subdimensions.map(sub => {
                                                    const isSubExp = expandedSubs[sub.id];
                                                    const subEnabled = isSubEnabled(dim.id, sub.id);

                                                    return (
                                                        <div key={sub.id} className="border-l-2 border-slate-200 ml-2">
                                                            <div className="flex items-center gap-2 p-2">
                                                                <button
                                                                    onClick={() => setExpandedSubs(p => ({ ...p, [sub.id]: !p[sub.id] }))}
                                                                    className="p-1 rounded hover:bg-slate-100"
                                                                >
                                                                    {isSubExp ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                                </button>
                                                                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={subEnabled}
                                                                        onChange={() => toggleSubdimension(dim.id, sub.id)}
                                                                        className="w-4 h-4 rounded"
                                                                        style={{ accentColor: form.color }}
                                                                    />
                                                                    <span className="text-sm text-slate-700">{sub.title}</span>
                                                                </label>
                                                                <span className="text-xs text-slate-400">{sub.indicators.length} ind.</span>
                                                            </div>

                                                            {/* Indicators */}
                                                            {isSubExp && subEnabled && (
                                                                <div className="pl-8 pb-2 space-y-1">
                                                                    {sub.indicators.map(ind => (
                                                                        <label key={ind.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isIndEnabled(ind.id)}
                                                                                onChange={() => toggleIndicator(ind.id)}
                                                                                className="w-4 h-4 rounded"
                                                                                style={{ accentColor: form.color }}
                                                                            />
                                                                            <span className="text-sm text-slate-600">{ind.label}</span>
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
                    <button onClick={onClose} className="btn btn-secondary">Cancelar</button>
                    <button onClick={handleSubmit} className="btn btn-primary">
                        <Save size={18} />
                        Guardar Herramienta
                    </button>
                </div>
            </div>
        </div>
    );
}
