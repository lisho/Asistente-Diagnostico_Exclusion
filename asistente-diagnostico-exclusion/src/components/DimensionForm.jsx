import React, { useMemo, useRef, useState } from 'react';
import {
    ChevronDown, ChevronRight, AlertTriangle, Activity, Link2,
    CheckCircle, ArrowDown, User, Minus, Plus, HelpCircle, Info, Sparkles
} from 'lucide-react';
import { evaluateDependency } from '../data/dimensions';

// Self-perception scale configuration
const SELF_PERCEPTION_LEVELS = [
    { value: 0, label: 'Muy Mal', emoji: '😰', color: '#E66414', bgLight: 'rgba(230, 100, 20, 0.1)' },
    { value: 1, label: 'Mal', emoji: '😟', color: '#FF924D', bgLight: 'rgba(255, 146, 77, 0.15)' },
    { value: 2, label: 'Regular', emoji: '😐', color: '#9AD3DA', bgLight: 'rgba(154, 211, 218, 0.3)' },
    { value: 3, label: 'Bien', emoji: '🙂', color: '#00A8A8', bgLight: 'rgba(0, 168, 168, 0.15)' },
    { value: 4, label: 'Muy Bien', emoji: '😊', color: '#03444A', bgLight: 'rgba(3, 68, 74, 0.15)' },
];

// Professional EIE scale
const EIE_LEVELS = [
    { value: 0, label: 'Sin problemas', color: '#03444A', desc: 'Situación normalizada' },
    { value: 1, label: 'Leve', color: '#00A8A8', desc: 'Problemas menores' },
    { value: 2, label: 'Moderada', color: '#9AD3DA', desc: 'Acceso limitado' },
    { value: 3, label: 'Severa', color: '#FF924D', desc: 'Barreras graves' },
    { value: 4, label: 'Crítica', color: '#E66414', desc: 'Emergencia social' },
];

export function DimensionForm({ dimension, answers, onChange }) {
    const formRef = useRef(null);
    // Track which subdimensions are expanded (default: first one expanded)
    const [expandedSubs, setExpandedSubs] = useState(() => {
        const initial = {};
        if (dimension?.subdimensions?.[0]) {
            initial[dimension.subdimensions[0].id] = true;
        }
        return initial;
    });

    if (!dimension) return <div className="text-center py-20 text-slate-500">Dimensión no encontrada</div>;

    const handleChange = (fieldId, value) => onChange(dimension.id, fieldId, value);
    const currentAnswers = answers[dimension.id] || {};

    const toggleSubdimension = (subId) => {
        setExpandedSubs(prev => ({ ...prev, [subId]: !prev[subId] }));
    };

    const expandAll = () => {
        const all = {};
        dimension.subdimensions?.forEach(sub => { all[sub.id] = true; });
        setExpandedSubs(all);
    };

    const collapseAll = () => setExpandedSubs({});

    // Calculate completion stats
    const completionStats = useMemo(() => {
        let total = 0;
        let completed = 0;
        const subdimStats = {};

        dimension.subdimensions?.forEach(sub => {
            const visibleIndicators = sub.indicators.filter(ind =>
                !ind.dependsOn || evaluateDependency(ind.dependsOn, currentAnswers)
            );

            const subCompleted = visibleIndicators.filter(ind => {
                const val = currentAnswers[ind.id];
                return val !== undefined && val !== '' && val !== null;
            }).length;

            subdimStats[sub.id] = {
                total: visibleIndicators.length,
                completed: subCompleted,
                percentage: visibleIndicators.length > 0 ? Math.round((subCompleted / visibleIndicators.length) * 100) : 100
            };

            total += visibleIndicators.length;
            completed += subCompleted;
        });

        return {
            total,
            completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            subdimStats
        };
    }, [dimension, currentAnswers]);

    const currentEIE = EIE_LEVELS[currentAnswers.valuation || 0];
    const currentPerception = SELF_PERCEPTION_LEVELS[currentAnswers.selfPerception ?? -1];

    const isIndicatorVisible = (field) => {
        if (!field.dependsOn) return true;
        return evaluateDependency(field.dependsOn, currentAnswers);
    };

    const getDependencyInfo = (field) => {
        if (!field.dependsOn) return null;
        let parentLabel = field.dependsOn.indicatorId;
        dimension.subdimensions.forEach(sub => {
            sub.indicators.forEach(ind => {
                if (ind.id === field.dependsOn.indicatorId) parentLabel = ind.label;
            });
        });
        return { parentLabel };
    };

    const scrollToNextEmpty = () => {
        for (const sub of dimension.subdimensions || []) {
            for (const ind of sub.indicators) {
                if (!isIndicatorVisible(ind)) continue;
                const val = currentAnswers[ind.id];
                if (val === undefined || val === '' || val === null) {
                    // Expand the subdimension first
                    setExpandedSubs(prev => ({ ...prev, [sub.id]: true }));
                    setTimeout(() => {
                        const element = document.getElementById(`field-${ind.id}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.focus?.();
                        }
                    }, 100);
                    return;
                }
            }
        }
    };

    const renderField = (field) => {
        const value = currentAnswers[field.id];
        const depInfo = getDependencyInfo(field);
        const isCompleted = value !== undefined && value !== '' && value !== null &&
            (field.type !== 'checkbox' || (Array.isArray(value) && value.length > 0));

        const fieldContent = (() => {
            switch (field.type) {
                case 'select':
                    return (
                        <div className="relative">
                            <select
                                id={`field-${field.id}`}
                                value={value || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className={`select pr-10 ${isCompleted ? 'border-teal-300 bg-teal-50/30' : ''}`}
                            >
                                <option value="">Seleccione...</option>
                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    );

                case 'radio':
                    // Radio buttons displayed as horizontal chips - single selection
                    return (
                        <div className="flex flex-wrap gap-2">
                            {field.options?.map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleChange(field.id, opt)}
                                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all border-2
                                        ${value === opt
                                            ? 'bg-teal-50 border-teal-400 text-teal-700 shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    );

                case 'checkbox':
                    // Checkboxes for multiple selection
                    const selectedValues = Array.isArray(value) ? value : [];
                    return (
                        <div className="flex flex-wrap gap-2">
                            {field.options?.map(opt => {
                                const isSelected = selectedValues.includes(opt);
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            const newValues = isSelected
                                                ? selectedValues.filter(v => v !== opt)
                                                : [...selectedValues, opt];
                                            handleChange(field.id, newValues);
                                        }}
                                        className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all border-2 flex items-center gap-2
                                            ${isSelected
                                                ? 'bg-teal-50 border-teal-400 text-teal-700 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                            }`}
                                    >
                                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                                            ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-slate-300'}`}>
                                            {isSelected && <CheckCircle size={12} className="text-white" />}
                                        </span>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    );

                case 'scale':
                    // Likert scale - visual rating 1 to max (default 5)
                    const scaleMax = field.scaleMax || 5;
                    const scaleLabels = field.scaleLabels || {};
                    const scaleColors = ['#E66414', '#FF924D', '#9AD3DA', '#00A8A8', '#03444A'];
                    return (
                        <div className="space-y-2">
                            <div className="flex justify-between gap-1">
                                {Array.from({ length: scaleMax }, (_, i) => i + 1).map(num => {
                                    const isSelected = value === num;
                                    const colorIndex = Math.floor((num - 1) / (scaleMax - 1) * (scaleColors.length - 1));
                                    const color = scaleColors[colorIndex];
                                    return (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => handleChange(field.id, num)}
                                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2
                                                ${isSelected
                                                    ? 'shadow-lg scale-105'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                            style={isSelected ? {
                                                backgroundColor: color + '20',
                                                borderColor: color,
                                                color: color
                                            } : {}}
                                        >
                                            {num}
                                        </button>
                                    );
                                })}
                            </div>
                            {(scaleLabels.min || scaleLabels.max) && (
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>{scaleLabels.min || ''}</span>
                                    <span>{scaleLabels.max || ''}</span>
                                </div>
                            )}
                        </div>
                    );

                case 'range':
                    // Slider with numeric value display
                    const rangeMin = field.min ?? 0;
                    const rangeMax = field.max ?? 100;
                    const rangeStep = field.step ?? 1;
                    const currentVal = value ?? rangeMin;
                    const percentage = ((currentVal - rangeMin) / (rangeMax - rangeMin)) * 100;
                    return (
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <input
                                    id={`field-${field.id}`}
                                    type="range"
                                    min={rangeMin}
                                    max={rangeMax}
                                    step={rangeStep}
                                    value={currentVal}
                                    onChange={(e) => handleChange(field.id, parseFloat(e.target.value))}
                                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #00A8A8 0%, #00A8A8 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`
                                    }}
                                />
                                <span className={`min-w-[60px] text-center px-3 py-2 rounded-lg font-bold text-lg
                                    ${isCompleted ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {currentVal}{field.unit || ''}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>{rangeMin}{field.unit || ''}</span>
                                <span>{rangeMax}{field.unit || ''}</span>
                            </div>
                        </div>
                    );

                case 'date':
                    return (
                        <input
                            id={`field-${field.id}`}
                            type="date"
                            value={value || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className={`input ${isCompleted ? 'border-teal-300 bg-teal-50/30' : ''}`}
                        />
                    );

                case 'text':
                    return (
                        <textarea
                            id={`field-${field.id}`}
                            value={value || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            rows={3}
                            className={`input resize-none ${isCompleted ? 'border-teal-300 bg-teal-50/30' : ''}`}
                            placeholder="Escriba aquí..."
                        />
                    );

                case 'number':
                    return (
                        <input
                            id={`field-${field.id}`}
                            type="number"
                            value={value || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className={`input ${isCompleted ? 'border-teal-300 bg-teal-50/30' : ''}`}
                            placeholder="0"
                            min={field.min}
                            max={field.max}
                        />
                    );

                case 'boolean':
                    return (
                        <div className="flex gap-3">
                            {['yes', 'no'].map(val => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleChange(field.id, val)}
                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all border-2
                    ${value === val
                                            ? val === 'yes'
                                                ? 'bg-teal-50 border-teal-400 text-teal-700 shadow-sm'
                                                : 'bg-slate-100 border-slate-400 text-slate-700'
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                >
                                    {val === 'yes' ? 'Sí' : 'No'}
                                </button>
                            ))}
                        </div>
                    );

                default:
                    return null;
            }
        })();

        return (
            <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                    <label className="label flex-1 mb-0">{field.label}</label>
                    {field.description && (
                        <span
                            className="group relative cursor-help"
                            title={field.description}
                        >
                            <HelpCircle size={16} className="text-slate-400 hover:text-teal-500 transition-colors" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity w-64 z-50 shadow-lg pointer-events-none">
                                {field.description}
                            </span>
                        </span>
                    )}
                    {isCompleted && <CheckCircle size={16} className="text-teal-500" />}
                    {depInfo && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255, 146, 77, 0.15)', color: '#E66414' }}
                            title={`Depende de: ${depInfo.parentLabel}`}
                        >
                            <Link2 size={12} />
                            Condicional
                        </span>
                    )}
                </div>
                {fieldContent}
            </div>
        );
    };

    return (
        <div ref={formRef} className="animate-fade-in pb-12">
            {/* Header with Progress */}
            <header className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full"
                        style={{ background: 'rgba(0, 168, 168, 0.15)', color: '#03444A' }}>
                        Dimensión {dimension.id.replace('dim', '')}
                    </span>
                    <span className="px-3 py-1 text-xs font-bold rounded-full"
                        style={{
                            background: completionStats.percentage === 100 ? 'rgba(0, 168, 168, 0.15)' : 'rgba(255, 146, 77, 0.15)',
                            color: completionStats.percentage === 100 ? '#03444A' : '#E66414'
                        }}>
                        {completionStats.percentage}% completado
                    </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">{dimension.title}</h1>
                <p className="text-lg text-slate-500 max-w-2xl mb-6">{dimension.description}</p>

                {/* Progress Bar and Actions */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px] progress-bar">
                        <div className="progress-fill" style={{ width: `${completionStats.percentage}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">
                        {completionStats.completed}/{completionStats.total}
                    </span>
                    {completionStats.percentage < 100 && (
                        <button
                            onClick={scrollToNextEmpty}
                            className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all"
                            style={{ background: 'rgba(255, 146, 77, 0.15)', color: '#E66414' }}
                        >
                            <ArrowDown size={14} />
                            Ir al siguiente
                        </button>
                    )}
                    <div className="flex gap-1">
                        <button
                            onClick={expandAll}
                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title="Expandir todo"
                        >
                            <Plus size={18} />
                        </button>
                        <button
                            onClick={collapseAll}
                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title="Colapsar todo"
                        >
                            <Minus size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Subdimensions (Collapsible) */}
            <div className="space-y-4 mb-10">
                {dimension.subdimensions?.map((subdim) => {
                    const visibleIndicators = subdim.indicators.filter(isIndicatorVisible);
                    const hiddenCount = subdim.indicators.length - visibleIndicators.length;
                    const stats = completionStats.subdimStats[subdim.id];
                    const isExpanded = expandedSubs[subdim.id];
                    const isComplete = stats?.percentage === 100;

                    return (
                        <section key={subdim.id} className="card overflow-hidden">
                            {/* Collapsible Header */}
                            <button
                                onClick={() => toggleSubdimension(subdim.id)}
                                className="w-full flex items-center gap-3 p-4 -m-6 mb-0 hover:bg-slate-50/50 transition-colors text-left"
                            >
                                <div className={`p-1 rounded-lg transition-colors ${isExpanded ? 'bg-teal-100' : 'bg-slate-100'}`}>
                                    {isExpanded ? (
                                        <ChevronDown size={20} style={{ color: '#00A8A8' }} />
                                    ) : (
                                        <ChevronRight size={20} className="text-slate-400" />
                                    )}
                                </div>

                                <div className="w-1.5 h-8 rounded-full transition-colors"
                                    style={{ background: isComplete ? '#00A8A8' : '#9AD3DA' }} />

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-slate-900 truncate">{subdim.title}</h3>
                                    {subdim.description && (
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{subdim.description}</p>
                                    )}
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {stats?.completed || 0} de {stats?.total || 0} campos completados
                                        {hiddenCount > 0 && ` • ${hiddenCount} oculto${hiddenCount > 1 ? 's' : ''}`}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Progress ring */}
                                    <div className="relative w-10 h-10">
                                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                            <circle
                                                cx="18" cy="18" r="14" fill="none"
                                                stroke={isComplete ? '#00A8A8' : '#FF924D'}
                                                strokeWidth="3"
                                                strokeDasharray={`${(stats?.percentage || 0) * 0.88} 88`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                                            style={{ color: isComplete ? '#00A8A8' : '#E66414' }}>
                                            {stats?.percentage || 0}%
                                        </span>
                                    </div>

                                    {isComplete && <CheckCircle size={20} style={{ color: '#00A8A8' }} />}
                                </div>
                            </button>

                            {/* Collapsible Content */}
                            {isExpanded && (
                                <div className="pt-6 mt-4 border-t border-slate-100 animate-fade-in">
                                    {/* Subdimension description if exists */}
                                    {subdim.description && (
                                        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-teal-50 to-slate-50 border border-teal-100">
                                            <div className="flex items-start gap-2">
                                                <Info size={18} className="text-teal-500 mt-0.5 shrink-0" />
                                                <p className="text-sm text-slate-600">
                                                    <strong className="text-teal-700">Guía de valoración:</strong> {subdim.description}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {visibleIndicators.length > 0 ? (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {visibleIndicators.map((field) => (
                                                <div key={field.id} className={field.type === 'text' ? 'md:col-span-2' : ''}>
                                                    {renderField(field)}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 italic">
                                            Complete los campos anteriores para desbloquear estos indicadores
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>

            {/* Bottom Panel: Self-Perception + Risks + EIE */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Self-Perception Scale */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdfa 100%)' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg" style={{ background: 'rgba(0, 168, 168, 0.15)' }}>
                            <User size={22} style={{ color: '#00A8A8' }} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Autopercepción</h3>
                            <p className="text-xs text-slate-500">¿Cómo se siente usted en esta área?</p>
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        {SELF_PERCEPTION_LEVELS.map((level) => {
                            const isActive = currentAnswers.selfPerception === level.value;
                            return (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => handleChange('selfPerception', level.value)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${isActive ? 'shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    style={isActive ? {
                                        background: level.bgLight,
                                        borderColor: level.color,
                                        color: level.color
                                    } : {}}
                                >
                                    <span className="text-xl">{level.emoji}</span>
                                    <span className="flex-1 text-left">{level.label}</span>
                                    {isActive && <CheckCircle size={18} />}
                                </button>
                            );
                        })}
                    </div>

                    {currentPerception && (
                        <div className="p-3 rounded-xl text-center text-sm font-medium"
                            style={{ background: currentPerception.bgLight, color: currentPerception.color }}>
                            Valoración del usuario: <strong>{currentPerception.label}</strong>
                        </div>
                    )}
                </div>

                {/* Risk Factors */}
                {dimension.risks?.length > 0 && (
                    <div className="card" style={{ background: 'rgba(230, 100, 20, 0.03)', borderColor: 'rgba(230, 100, 20, 0.2)' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg" style={{ background: 'rgba(230, 100, 20, 0.15)' }}>
                                <AlertTriangle size={22} style={{ color: '#E66414' }} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Riesgos Críticos Identificados</h3>
                        </div>
                        <div className="space-y-2 max-h-[350px] overflow-y-auto">
                            {dimension.risks.map(risk => {
                                const checked = currentAnswers.risks?.[risk.id] || false;
                                return (
                                    <label
                                        key={risk.id}
                                        className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                      ${checked
                                                ? 'border-orange-300 shadow-sm'
                                                : 'bg-white/50 border-transparent hover:bg-white hover:border-orange-100'}`}
                                        style={checked ? { background: 'rgba(255, 146, 77, 0.1)' } : {}}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => handleChange('risks', { ...currentAnswers.risks, [risk.id]: e.target.checked })}
                                            className="mt-0.5 w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                                            style={{ accentColor: '#E66414' }}
                                        />
                                        <span className={`text-sm ${checked ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                                            {risk.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* EIE Professional Valuation */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #03444A 0%, #00A8A8 100%)' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-white/15">
                            <Activity size={22} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Valoración EIE</h3>
                            <p className="text-xs text-white/60">Análisis profesional</p>
                        </div>
                    </div>

                    <div className="flex items-end justify-between mb-4">
                        <span className="text-sm font-medium text-white/70">Nivel detectado</span>
                        <div className="text-right">
                            <span className="block text-4xl font-black text-white">{currentAnswers.valuation || 0}</span>
                            <span className="text-sm font-bold" style={{ color: currentEIE.color === '#03444A' ? '#9AD3DA' : currentEIE.color }}>
                                {currentEIE.label}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                        {EIE_LEVELS.map((level) => (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => handleChange('valuation', level.value)}
                                className="flex-1 h-3 rounded-full transition-all hover:opacity-80"
                                style={{ background: (currentAnswers.valuation || 0) >= level.value ? level.color : 'rgba(255,255,255,0.2)' }}
                                title={level.label}
                            />
                        ))}
                    </div>

                    <div className="flex justify-between text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">
                        <span>Sano</span>
                        <span>Crítico</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white/10 border border-white/10">
                        <p className="text-sm text-white/80 italic text-center">"{currentEIE.desc}"</p>
                    </div>
                </div>

                {/* Potentialities & Resources (Appreciative Approach) */}
                <div className="card lg:col-span-3" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                            <Sparkles size={22} style={{ color: '#10b981' }} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900">Potencialidades y Recursos</h3>
                            <p className="text-xs text-slate-500">Enfoque apreciativo: fortalezas, capacidades y recursos identificados</p>
                        </div>
                        {/* Counter */}
                        {dimension.potentialities && (
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                                    {Object.values(currentAnswers.potentialitiesChecked || {}).filter(Boolean).length} / {dimension.potentialities.length}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 rounded-xl bg-white/60 border border-emerald-100 mb-4">
                        <p className="text-sm text-slate-600">
                            🌟 <strong>Guía:</strong> Identifique habilidades, redes de apoyo, experiencias positivas,
                            motivaciones, recursos materiales o inmateriales que la persona posee y que pueden
                            facilitar su proceso de inclusión.
                        </p>
                    </div>

                    {/* Predefined potentialities as checkboxes */}
                    {dimension.potentialities && dimension.potentialities.length > 0 && (
                        <div className="grid gap-2 mb-4">
                            {dimension.potentialities.map((pot) => {
                                const checked = currentAnswers.potentialitiesChecked?.[pot.id] === true;
                                return (
                                    <label
                                        key={pot.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked
                                            ? 'border-emerald-300 shadow-sm bg-emerald-50'
                                            : 'bg-white/50 border-transparent hover:bg-white hover:border-emerald-100'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => handleChange('potentialitiesChecked', {
                                                ...currentAnswers.potentialitiesChecked,
                                                [pot.id]: e.target.checked
                                            })}
                                            className="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                                            style={{ accentColor: '#10b981' }}
                                        />
                                        <span className={`text-sm ${checked ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                                            {pot.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {/* Additional notes textarea */}
                    <div className="border-t border-emerald-100 pt-4">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Otras potencialidades observadas (texto libre):
                        </label>
                        <textarea
                            value={currentAnswers.potentialitiesNotes || ''}
                            onChange={(e) => handleChange('potentialitiesNotes', e.target.value)}
                            rows={3}
                            className="w-full p-4 rounded-xl border-2 border-emerald-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all resize-none text-slate-700"
                            placeholder="Ej: Red de apoyo en parroquia local, experiencia previa como cuidador, habilidades manuales..."
                        />
                    </div>

                    {(Object.values(currentAnswers.potentialitiesChecked || {}).filter(Boolean).length > 0 || currentAnswers.potentialitiesNotes) && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
                            <CheckCircle size={16} />
                            <span>Potencialidades registradas</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
