import React from 'react';
import { ChevronDown, AlertTriangle, Activity, Link2 } from 'lucide-react';
import { evaluateDependency } from '../data/dimensions';

export function DimensionForm({ dimension, answers, onChange }) {
    if (!dimension) return <div className="text-center py-20 text-slate-500">Dimensión no encontrada</div>;

    const handleChange = (fieldId, value) => onChange(dimension.id, fieldId, value);
    const currentAnswers = answers[dimension.id] || {};

    const EIE_LEVELS = [
        { value: 0, label: 'Sin problemas', color: 'bg-emerald-500', desc: 'Situación normalizada' },
        { value: 1, label: 'Leve', color: 'bg-lime-500', desc: 'Problemas menores' },
        { value: 2, label: 'Moderada', color: 'bg-amber-500', desc: 'Acceso limitado' },
        { value: 3, label: 'Severa', color: 'bg-orange-500', desc: 'Barreras graves' },
        { value: 4, label: 'Crítica', color: 'bg-red-500', desc: 'Emergencia social' },
    ];

    const currentEIE = EIE_LEVELS[currentAnswers.valuation || 0];

    // Check if an indicator should be visible based on its dependency
    const isIndicatorVisible = (field) => {
        if (!field.dependsOn) return true;
        return evaluateDependency(field.dependsOn, currentAnswers);
    };

    // Get parent indicator label for dependency tooltip
    const getDependencyInfo = (field) => {
        if (!field.dependsOn) return null;

        // Find parent indicator
        let parentLabel = field.dependsOn.indicatorId;
        dimension.subdimensions.forEach(sub => {
            sub.indicators.forEach(ind => {
                if (ind.id === field.dependsOn.indicatorId) {
                    parentLabel = ind.label;
                }
            });
        });

        return { parentLabel, condition: field.dependsOn.condition, value: field.dependsOn.value };
    };

    // Render a field based on its type
    const renderField = (field) => {
        const value = currentAnswers[field.id];
        const depInfo = getDependencyInfo(field);

        const fieldContent = (() => {
            switch (field.type) {
                case 'select':
                    return (
                        <div className="relative">
                            <select
                                value={value || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className="select pr-10"
                            >
                                <option value="">Seleccione...</option>
                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    );

                case 'text':
                    return (
                        <textarea
                            value={value || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            rows={3}
                            className="input resize-none"
                            placeholder="Escriba aquí..."
                        />
                    );

                case 'number':
                    return (
                        <input
                            type="number"
                            value={value || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="input"
                            placeholder="0"
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
                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all border
                    ${value === val
                                            ? val === 'yes'
                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                                : 'bg-slate-100 border-slate-300 text-slate-700'
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
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
            <div>
                <div className="flex items-center gap-2">
                    <label className="label flex-1">{field.label}</label>
                    {depInfo && (
                        <span
                            className="flex items-center gap-1 text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full"
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
        <div className="animate-fade-in pb-12">
            {/* Header */}
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 rounded-full">
                        Dimensión {dimension.id.replace('dim', '')}
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">{dimension.title}</h1>
                <p className="text-lg text-slate-500 max-w-2xl">{dimension.description}</p>
            </header>

            {/* Subdimensions with Indicators */}
            <div className="space-y-6 mb-10">
                {dimension.subdimensions?.map((subdim) => {
                    // Filter visible indicators based on dependencies
                    const visibleIndicators = subdim.indicators.filter(isIndicatorVisible);
                    const hiddenCount = subdim.indicators.length - visibleIndicators.length;

                    return (
                        <section key={subdim.id} className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="section-title mb-0">
                                    <div className="w-1 h-5 rounded-full bg-indigo-500" />
                                    {subdim.title}
                                </h3>
                                {hiddenCount > 0 && (
                                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                        {hiddenCount} campo{hiddenCount > 1 ? 's' : ''} oculto{hiddenCount > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

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
                        </section>
                    );
                })}
            </div>

            {/* Bottom Panel: Risks + EIE */}
            <div className="grid lg:grid-cols-2 gap-6">

                {/* Risk Factors */}
                {dimension.risks?.length > 0 && (
                    <div className="card bg-red-50/50 border-red-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-red-100 text-red-600">
                                <AlertTriangle size={22} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Factores de Riesgo Crítico</h3>
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {dimension.risks.map(risk => {
                                const checked = currentAnswers.risks?.[risk.id] || false;
                                return (
                                    <label
                                        key={risk.id}
                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                      ${checked ? 'bg-white border-red-200 shadow-sm' : 'bg-white/50 border-transparent hover:bg-white hover:border-red-100'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => handleChange('risks', { ...currentAnswers.risks, [risk.id]: e.target.checked })}
                                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
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

                {/* EIE Valuation */}
                <div className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-white/10">
                            <Activity size={22} />
                        </div>
                        <h3 className="text-lg font-bold">Valoración Profesional (EIE)</h3>
                    </div>

                    <p className="text-sm text-slate-400 mb-6">
                        Asigne un nivel de exclusión basado en su análisis profesional de esta dimensión.
                    </p>

                    <div className="flex items-end justify-between mb-4">
                        <span className="text-sm font-medium text-slate-400">Nivel detectado</span>
                        <div className="text-right">
                            <span className="block text-4xl font-black">{currentAnswers.valuation || 0}</span>
                            <span className={`text-sm font-bold ${currentEIE.color.replace('bg-', 'text-')}`}>
                                {currentEIE.label}
                            </span>
                        </div>
                    </div>

                    {/* Slider Buttons */}
                    <div className="flex gap-2 mb-4">
                        {EIE_LEVELS.map((level) => (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => handleChange('valuation', level.value)}
                                className={`flex-1 h-3 rounded-full transition-all
                  ${(currentAnswers.valuation || 0) >= level.value ? level.color : 'bg-white/10'}
                  hover:opacity-80`}
                                title={level.label}
                            />
                        ))}
                    </div>

                    <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <span>Sano</span>
                        <span>Crítico</span>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-sm text-slate-300 italic text-center">
                            "{currentEIE.desc}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
