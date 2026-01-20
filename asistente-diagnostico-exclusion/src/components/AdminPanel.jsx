import React, { useState, useEffect } from 'react';
import {
    ChevronRight, ChevronDown, Layers, FolderTree, FileText,
    AlertTriangle, Settings, Hash, ToggleLeft, List, Type,
    ArrowLeft, Copy, Check, Link2, Eye, EyeOff, Edit3, X,
    Save, Trash2, Plus, Move, RotateCcw, ChevronUp, GripVertical, Wrench, ToggleRight
} from 'lucide-react';
import {
    getDimensionsConfig, saveDimensionsConfig, resetDimensionsConfig,
    updateIndicator, moveIndicator, deleteIndicator, addIndicator,
    duplicateIndicator, getAllSubdimensions, getDimensionIndicators
} from '../data/dimensionsService';
import { ToolsManager } from './ToolsManager';

export function AdminPanel({ onBack }) {
    const [dimensions, setDimensions] = useState(() => getDimensionsConfig());
    const [expandedDims, setExpandedDims] = useState({});
    const [expandedSubs, setExpandedSubs] = useState({});
    const [viewMode, setViewMode] = useState('tree');
    const [copied, setCopied] = useState(false);
    const [showDependencies, setShowDependencies] = useState(true);
    const [editingIndicator, setEditingIndicator] = useState(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState('dimensions'); // 'dimensions' or 'tools'

    // Refresh dimensions from storage
    const refreshDimensions = () => setDimensions(getDimensionsConfig());

    const toggleDim = (dimId) => setExpandedDims(prev => ({ ...prev, [dimId]: !prev[dimId] }));
    const toggleSub = (subId) => setExpandedSubs(prev => ({ ...prev, [subId]: !prev[subId] }));

    const expandAll = () => {
        const dims = {}, subs = {};
        Object.keys(dimensions).forEach(dimId => {
            dims[dimId] = true;
            dimensions[dimId].subdimensions.forEach(sub => subs[sub.id] = true);
        });
        setExpandedDims(dims);
        setExpandedSubs(subs);
    };

    const collapseAll = () => {
        setExpandedDims({});
        setExpandedSubs({});
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(dimensions, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        const reset = resetDimensionsConfig();
        setDimensions(reset);
        setShowResetConfirm(false);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'select': return <List size={14} className="text-blue-500" />;
            case 'boolean': return <ToggleLeft size={14} className="text-green-500" />;
            case 'number': return <Hash size={14} className="text-amber-500" />;
            case 'text': return <Type size={14} className="text-purple-500" />;
            default: return null;
        }
    };

    const formatCondition = (condition) => {
        switch (condition) {
            case 'equals': return '=';
            case 'notEquals': return '≠';
            case 'includes': return '∈';
            default: return condition;
        }
    };

    const getParentIndicatorLabel = (indicatorId, dimId) => {
        const dim = dimensions[dimId];
        if (!dim) return indicatorId;
        for (const sub of dim.subdimensions) {
            for (const ind of sub.indicators) {
                if (ind.id === indicatorId) return ind.label;
            }
        }
        return indicatorId;
    };

    // Calculate stats
    const totalIndicators = Object.values(dimensions).reduce((acc, dim) =>
        acc + dim.subdimensions.reduce((a, s) => a + s.indicators.length, 0), 0);
    const totalDependentIndicators = Object.values(dimensions).reduce((acc, dim) =>
        acc + dim.subdimensions.reduce((a, s) => a + s.indicators.filter(i => i.dependsOn).length, 0), 0);
    const totalSubdimensions = Object.values(dimensions).reduce((acc, dim) => acc + dim.subdimensions.length, 0);
    const totalRisks = Object.values(dimensions).reduce((acc, dim) => acc + dim.risks.length, 0);

    // Edit Modal Component
    const EditIndicatorModal = ({ data, onClose }) => {
        const { indicator, dimId, subId } = data;
        const [form, setForm] = useState({
            label: indicator.label,
            type: indicator.type,
            description: indicator.description || '',
            options: indicator.options || [],
            hasDependency: !!indicator.dependsOn,
            depIndicatorId: indicator.dependsOn?.indicatorId || '',
            depCondition: indicator.dependsOn?.condition || 'equals',
            depValue: Array.isArray(indicator.dependsOn?.value)
                ? indicator.dependsOn.value.join('\n')
                : indicator.dependsOn?.value || ''
        });
        const [targetSubId, setTargetSubId] = useState(`${dimId}:${subId}`);
        const [showMoveSection, setShowMoveSection] = useState(false);
        const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
        const [newOption, setNewOption] = useState('');

        const allSubdimensions = getAllSubdimensions(dimensions);
        const dimensionIndicators = getDimensionIndicators(dimensions, dimId)
            .filter(i => i.id !== indicator.id);

        // Handlers for tag-based options
        const addOption = () => {
            const trimmed = newOption.trim();
            if (trimmed && !form.options.includes(trimmed)) {
                setForm({ ...form, options: [...form.options, trimmed] });
                setNewOption('');
            }
        };

        const removeOption = (index) => {
            setForm({ ...form, options: form.options.filter((_, i) => i !== index) });
        };

        const handleOptionKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addOption();
            }
        };

        const handleSave = () => {
            const updates = {
                label: form.label,
                type: form.type,
                description: form.description.trim() || undefined
            };

            if (form.type === 'select' && form.options.length > 0) {
                updates.options = form.options;
            } else {
                delete updates.options;
            }

            if (form.hasDependency && form.depIndicatorId) {
                let depValue = form.depValue;
                if (form.depCondition === 'includes') {
                    depValue = form.depValue.split('\n').map(v => v.trim()).filter(v => v);
                }
                updates.dependsOn = {
                    indicatorId: form.depIndicatorId,
                    condition: form.depCondition,
                    value: depValue
                };
            } else {
                updates.dependsOn = undefined;
            }

            const newConfig = updateIndicator(dimensions, dimId, subId, indicator.id, updates);
            setDimensions(newConfig);

            // Handle move if target changed
            const [targetDim, targetSub] = targetSubId.split(':');
            if (targetDim !== dimId || targetSub !== subId) {
                const movedConfig = moveIndicator(newConfig, dimId, subId, indicator.id, targetDim, targetSub);
                setDimensions(movedConfig);
            }

            onClose();
        };

        const handleDelete = () => {
            const newConfig = deleteIndicator(dimensions, dimId, subId, indicator.id);
            setDimensions(newConfig);
            onClose();
        };

        const handleDuplicate = () => {
            const newConfig = duplicateIndicator(dimensions, dimId, subId, indicator.id);
            setDimensions(newConfig);
            onClose();
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-100">
                                    <Edit3 size={20} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Editar Indicador</h3>
                                    <p className="text-sm text-slate-500 font-mono">{indicator.id}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6 overflow-y-auto flex-1">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Información Básica</h4>

                            <div>
                                <label className="label">Etiqueta</label>
                                <input
                                    type="text"
                                    value={form.label}
                                    onChange={e => setForm({ ...form, label: e.target.value })}
                                    className="input"
                                    placeholder="Nombre del indicador"
                                />
                            </div>

                            <div>
                                <label className="label">Descripción/Ayuda (opcional)</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="input h-20 resize-none"
                                    placeholder="Texto de ayuda que explica cómo valorar este indicador. Aparecerá como tooltip junto al campo."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Tipo de campo</label>
                                    <select
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value, options: ['select', 'radio', 'checkbox'].includes(e.target.value) ? form.options : [] })}
                                        className="select"
                                    >
                                        <optgroup label="Selección">
                                            <option value="select">Dropdown (desplegable)</option>
                                            <option value="radio">Radio (chips excluyentes)</option>
                                            <option value="checkbox">Checkbox (selección múltiple)</option>
                                        </optgroup>
                                        <optgroup label="Entrada simple">
                                            <option value="boolean">Sí/No (boolean)</option>
                                            <option value="number">Número</option>
                                            <option value="text">Texto libre</option>
                                            <option value="date">Fecha</option>
                                        </optgroup>
                                        <optgroup label="Escalas visuales">
                                            <option value="scale">Escala likert (1-5)</option>
                                            <option value="range">Slider (rango numérico)</option>
                                        </optgroup>
                                    </select>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {form.type === 'radio' && '📌 Para pocas opciones (2-5), se muestran como chips'}
                                        {form.type === 'checkbox' && '☑️ Permite seleccionar múltiples opciones'}
                                        {form.type === 'scale' && '📊 Escala visual de 1 a 5 con colores'}
                                        {form.type === 'range' && '🎚️ Slider para valores numéricos en rango'}
                                    </p>
                                </div>

                                {['select', 'radio', 'checkbox'].includes(form.type) && (
                                    <div className="col-span-2">
                                        <label className="label">Opciones</label>
                                        {/* Input para añadir nuevas opciones */}
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={newOption}
                                                onChange={e => setNewOption(e.target.value)}
                                                onKeyDown={handleOptionKeyDown}
                                                className="input flex-1"
                                                placeholder="Escribe una opción y pulsa Enter..."
                                            />
                                            <button
                                                type="button"
                                                onClick={addOption}
                                                disabled={!newOption.trim()}
                                                className="btn btn-secondary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        {/* Lista de opciones como tags */}
                                        <div className="flex flex-wrap gap-2 min-h-[48px] p-3 rounded-xl bg-slate-50 border border-slate-200">
                                            {form.options.length === 0 ? (
                                                <span className="text-sm text-slate-400 italic">
                                                    No hay opciones definidas. Añade opciones arriba.
                                                </span>
                                            ) : (
                                                form.options.map((opt, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium group transition-all hover:bg-indigo-200"
                                                    >
                                                        {opt}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(index)}
                                                            className="p-0.5 rounded-full hover:bg-indigo-300 transition-colors"
                                                            title="Eliminar opción"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                        {form.options.length > 0 && (
                                            <p className="text-xs text-slate-400 mt-2">
                                                {form.options.length} opcion{form.options.length !== 1 ? 'es' : ''} definida{form.options.length !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dependency */}
                        <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <Link2 size={16} className="text-indigo-500" />
                                    Dependencia
                                </h4>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.hasDependency}
                                        onChange={e => setForm({ ...form, hasDependency: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                                    />
                                    <span className="text-sm text-slate-600">Activar</span>
                                </label>
                            </div>

                            {form.hasDependency && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="label">Indicador padre</label>
                                        <select
                                            value={form.depIndicatorId}
                                            onChange={e => setForm({ ...form, depIndicatorId: e.target.value })}
                                            className="select text-sm"
                                        >
                                            <option value="">Seleccione indicador...</option>
                                            {dimensionIndicators.map(ind => (
                                                <option key={ind.id} value={ind.id}>
                                                    {ind.label} ({ind.subTitle})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="label">Condición</label>
                                            <select
                                                value={form.depCondition}
                                                onChange={e => setForm({ ...form, depCondition: e.target.value })}
                                                className="select text-sm"
                                            >
                                                <option value="equals">Igual a (=)</option>
                                                <option value="notEquals">Diferente de (≠)</option>
                                                <option value="includes">Incluido en (∈)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="label">
                                                {form.depCondition === 'includes' ? 'Valores (uno por línea)' : 'Valor'}
                                            </label>
                                            {form.depCondition === 'includes' ? (
                                                <textarea
                                                    value={form.depValue}
                                                    onChange={e => setForm({ ...form, depValue: e.target.value })}
                                                    className="input h-20 resize-none text-sm font-mono"
                                                    placeholder="Valor 1&#10;Valor 2"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={form.depValue}
                                                    onChange={e => setForm({ ...form, depValue: e.target.value })}
                                                    className="input text-sm"
                                                    placeholder="Valor esperado"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Move Section */}
                        <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <Move size={16} className="text-blue-500" />
                                    Mover a otra subdimensión
                                </h4>
                                <button
                                    onClick={() => setShowMoveSection(!showMoveSection)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {showMoveSection ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>

                            {showMoveSection && (
                                <div>
                                    <label className="label">Subdimensión destino</label>
                                    <select
                                        value={targetSubId}
                                        onChange={e => setTargetSubId(e.target.value)}
                                        className="select text-sm"
                                    >
                                        {allSubdimensions.map(sub => (
                                            <option key={`${sub.dimId}:${sub.subId}`} value={`${sub.dimId}:${sub.subId}`}>
                                                {sub.fullLabel}
                                            </option>
                                        ))}
                                    </select>
                                    {targetSubId !== `${dimId}:${subId}` && (
                                        <p className="mt-2 text-sm text-amber-600 flex items-center gap-2">
                                            <AlertTriangle size={14} />
                                            El indicador se moverá al guardar
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Danger Zone */}
                        <div className="space-y-4 p-4 rounded-xl border border-red-200 bg-red-50/50">
                            <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider">Zona de Peligro</h4>

                            {showDeleteConfirm ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-red-600">¿Eliminar permanentemente?</span>
                                    <button
                                        onClick={handleDelete}
                                        className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700"
                                    >
                                        Sí, eliminar
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-300"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDuplicate}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-300"
                                    >
                                        <Copy size={14} />
                                        Duplicar
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200"
                                    >
                                        <Trash2 size={14} />
                                        Eliminar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                        <button onClick={onClose} className="btn btn-secondary">
                            Cancelar
                        </button>
                        <button onClick={handleSave} className="btn btn-primary">
                            <Save size={18} />
                            Guardar cambios
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Reset Confirmation Modal
    const ResetConfirmModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowResetConfirm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-amber-100">
                        <RotateCcw size={24} className="text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Restablecer configuración</h3>
                </div>
                <p className="text-slate-600 mb-6">
                    Esta acción eliminará todos los cambios realizados y restaurará la configuración original de indicadores.
                    <strong className="text-red-600"> Esta acción no se puede deshacer.</strong>
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowResetConfirm(false)} className="btn btn-secondary">
                        Cancelar
                    </button>
                    <button onClick={handleReset} className="btn bg-amber-500 text-white hover:bg-amber-600">
                        <RotateCcw size={18} />
                        Restablecer
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in pb-12">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Settings size={20} style={{ color: '#00A8A8' }} />
                            <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full"
                                style={{ background: 'rgba(0, 168, 168, 0.15)', color: '#03444A' }}>
                                Administración
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Panel de Administración</h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit mb-6">
                    <button
                        onClick={() => setActiveTab('dimensions')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'dimensions'
                            ? 'bg-white shadow-sm text-slate-900'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <FolderTree size={18} />
                        Árbol de Dimensiones
                    </button>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'tools'
                            ? 'bg-white shadow-sm text-slate-900'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Wrench size={18} />
                        Herramientas de Diagnóstico
                    </button>
                </div>
            </header>

            {/* Tab Content: Tools Manager */}
            {activeTab === 'tools' && <ToolsManager />}

            {/* Tab Content: Dimensions Tree */}
            {activeTab === 'dimensions' && (
                <>
                    {/* Dimensions Header */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-slate-500 max-w-2xl">
                            Gestiona la estructura de dimensiones, subdimensiones e indicadores. Los cambios se guardan automáticamente.
                        </p>
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="btn btn-secondary text-amber-600 border-amber-200 hover:bg-amber-50"
                        >
                            <RotateCcw size={18} />
                            Restablecer
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="card text-center">
                            <div className="text-3xl font-black text-indigo-600">{Object.keys(dimensions).length}</div>
                            <div className="text-sm font-medium text-slate-500">Dimensiones</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-3xl font-black text-blue-600">{totalSubdimensions}</div>
                            <div className="text-sm font-medium text-slate-500">Subdimensiones</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-3xl font-black text-emerald-600">{totalIndicators}</div>
                            <div className="text-sm font-medium text-slate-500">Indicadores</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-3xl font-black text-purple-600">{totalDependentIndicators}</div>
                            <div className="text-sm font-medium text-slate-500">Con dependencia</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-3xl font-black text-red-600">{totalRisks}</div>
                            <div className="text-sm font-medium text-slate-500">Riesgos</div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('tree')}
                                className={`btn ${viewMode === 'tree' ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                <FolderTree size={18} />
                                Árbol
                            </button>
                            <button
                                onClick={() => setViewMode('json')}
                                className={`btn ${viewMode === 'json' ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                <FileText size={18} />
                                JSON
                            </button>
                        </div>

                        {viewMode === 'tree' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDependencies(!showDependencies)}
                                    className={`btn btn-secondary ${showDependencies ? 'bg-indigo-50 border-indigo-200' : ''}`}
                                >
                                    {showDependencies ? <Eye size={18} /> : <EyeOff size={18} />}
                                    Dependencias
                                </button>
                                <button onClick={expandAll} className="btn btn-secondary text-sm">
                                    Expandir
                                </button>
                                <button onClick={collapseAll} className="btn btn-secondary text-sm">
                                    Colapsar
                                </button>
                            </div>
                        )}

                        {viewMode === 'json' && (
                            <button onClick={copyToClipboard} className="btn btn-secondary">
                                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                {copied ? 'Copiado!' : 'Copiar JSON'}
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    {viewMode === 'tree' ? (
                        <div className="card">
                            <div className="space-y-2">
                                {Object.values(dimensions).map((dim) => (
                                    <div key={dim.id} className="border border-slate-100 rounded-xl overflow-hidden">
                                        {/* Dimension Header */}
                                        <button
                                            onClick={() => toggleDim(dim.id)}
                                            className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-white hover:from-indigo-100 transition-colors text-left"
                                        >
                                            {expandedDims[dim.id] ? (
                                                <ChevronDown size={20} className="text-indigo-500" />
                                            ) : (
                                                <ChevronRight size={20} className="text-indigo-500" />
                                            )}
                                            <Layers size={20} className="text-indigo-600" />
                                            <div className="flex-1">
                                                <span className="font-bold text-slate-900">{dim.title}</span>
                                                <span className="ml-2 text-xs text-slate-400">
                                                    ({dim.subdimensions.length} subdim., {dim.subdimensions.reduce((a, s) => a + s.indicators.length, 0)} ind.)
                                                </span>
                                            </div>
                                            <span className="px-2 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-full">
                                                {dim.id.toUpperCase()}
                                            </span>
                                        </button>

                                        {/* Dimension Content */}
                                        {expandedDims[dim.id] && (
                                            <div className="border-t border-slate-100">
                                                <div className="px-12 py-3 bg-slate-50 text-sm text-slate-600 italic border-b border-slate-100">
                                                    {dim.description}
                                                </div>

                                                {/* Subdimensions */}
                                                <div className="pl-8">
                                                    {dim.subdimensions.map((sub) => {
                                                        const dependentCount = sub.indicators.filter(i => i.dependsOn).length;

                                                        return (
                                                            <div key={sub.id} className="border-b border-slate-50 last:border-0">
                                                                <button
                                                                    onClick={() => toggleSub(sub.id)}
                                                                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                                                                >
                                                                    {expandedSubs[sub.id] ? (
                                                                        <ChevronDown size={16} className="text-blue-400" />
                                                                    ) : (
                                                                        <ChevronRight size={16} className="text-blue-400" />
                                                                    )}
                                                                    <FolderTree size={16} className="text-blue-500" />
                                                                    <span className="font-semibold text-slate-700">{sub.title}</span>
                                                                    <span className="text-xs text-slate-400">({sub.indicators.length} indicadores)</span>
                                                                    {dependentCount > 0 && showDependencies && (
                                                                        <span className="flex items-center gap-1 text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                                            <Link2 size={10} />
                                                                            {dependentCount}
                                                                        </span>
                                                                    )}
                                                                </button>

                                                                {/* Indicators */}
                                                                {expandedSubs[sub.id] && (
                                                                    <div className="pl-10 pb-3 space-y-1">
                                                                        {/* Subdimension description */}
                                                                        {sub.description && (
                                                                            <div className="p-2 mb-2 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-blue-600 italic">
                                                                                📋 {sub.description}
                                                                            </div>
                                                                        )}
                                                                        {sub.indicators.map((ind) => (
                                                                            <div
                                                                                key={ind.id}
                                                                                onClick={() => setEditingIndicator({ indicator: ind, dimId: dim.id, subId: sub.id })}
                                                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors group
                                      ${ind.dependsOn ? 'bg-indigo-50/50 hover:bg-indigo-100' : 'bg-slate-50 hover:bg-slate-100'}`}
                                                                            >
                                                                                {getTypeIcon(ind.type)}
                                                                                <span className="flex-1 text-slate-700">{ind.label}</span>
                                                                                <span className="text-xs font-mono text-slate-400">{ind.type}</span>
                                                                                {ind.options && (
                                                                                    <span className="text-xs text-slate-400">[{ind.options.length}]</span>
                                                                                )}
                                                                                {ind.description && (
                                                                                    <span className="text-xs text-teal-500" title={ind.description}>❓</span>
                                                                                )}
                                                                                {ind.dependsOn && showDependencies && (
                                                                                    <span
                                                                                        className="flex items-center gap-1 text-xs text-indigo-500"
                                                                                        title={`Depende de: ${getParentIndicatorLabel(ind.dependsOn.indicatorId, dim.id)}`}
                                                                                    >
                                                                                        <Link2 size={12} />
                                                                                        {formatCondition(ind.dependsOn.condition)}
                                                                                    </span>
                                                                                )}
                                                                                <Edit3 size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Risks */}
                                                {dim.risks.length > 0 && (
                                                    <div className="px-8 py-4 bg-red-50/50 border-t border-red-100">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <AlertTriangle size={16} className="text-red-500" />
                                                            <span className="font-semibold text-red-700 text-sm">Factores de Riesgo Crítico</span>
                                                        </div>
                                                        <div className="grid gap-2">
                                                            {dim.risks.map((risk) => (
                                                                <div key={risk.id} className="flex items-center gap-2 text-sm text-red-700">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                                    {risk.label}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="card overflow-hidden">
                            <pre className="p-4 bg-slate-900 text-slate-100 text-sm overflow-auto max-h-[600px] rounded-xl font-mono">
                                {JSON.stringify(dimensions, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Edit Indicator Modal */}
                    {editingIndicator && (
                        <EditIndicatorModal
                            data={editingIndicator}
                            onClose={() => setEditingIndicator(null)}
                        />
                    )}

                    {/* Reset Confirmation Modal */}
                    {showResetConfirm && <ResetConfirmModal />}
                </>
            )}
        </div>
    );
}
