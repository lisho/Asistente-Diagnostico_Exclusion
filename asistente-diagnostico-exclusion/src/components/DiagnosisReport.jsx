import React, { useState } from 'react';
import { ScoringService } from '../services/ScoringService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertCircle, TrendingUp, Shield, AlertTriangle, Wrench, User, Eye, BarChart3, ChevronDown, ChevronRight, Sparkles, Check } from 'lucide-react';
import { getToolById } from '../data/toolsService';

// Mapeo de etiquetas cortas para los gráficos radar (más identificables)
const DIMENSION_SHORT_LABELS = {
    dim1: 'Económica',
    dim2: 'Vivienda',
    dim3: 'Salud',
    dim4: 'Mental',
    dim5: 'Educación',
    dim6: 'Relaciones',
    dim7: 'Ciudadanía',
    dim8: 'Legal'
};

export function DiagnosisReport({ dimensions, answers, currentCase }) {
    const [showRisksDetail, setShowRisksDetail] = useState(false);

    const isesScore = ScoringService.calculateISES(answers, dimensions);
    const isesLevel = ScoringService.getISESLevel(isesScore);
    const alerts = ScoringService.getDetectedAlerts(answers);
    const riskCount = ScoringService.countTotalRisks(answers);

    // Obtener información de la herramienta utilizada
    const tool = currentCase?.toolId ? getToolById(currentCase.toolId) : null;
    const toolName = tool?.name || currentCase?.toolName || 'Diagnóstico Completo';
    const toolColor = tool?.color || currentCase?.toolColor || '#0d9488';

    // Obtener pesos configurados de la herramienta (si existen)
    const toolWeights = tool?.weights || null;

    // Obtener etiqueta corta para dimensión
    const getShortLabel = (dim) => DIMENSION_SHORT_LABELS[dim.id] || dim.title.split(' ')[0];

    // Datos para la gráfica de valoración técnica (original)
    const technicalChartData = Object.values(dimensions).map(dim => ({
        subject: getShortLabel(dim),
        fullTitle: dim.title,
        value: parseFloat(answers[dim.id]?.valuation || 0),
        fullMark: 4
    }));

    // Datos para la gráfica de autopercepción
    const selfPerceptionChartData = Object.values(dimensions).map(dim => {
        const sp = answers[dim.id]?.selfPerception;
        // Convertir de escala 1-5 a escala de exclusión 0-4 (5=mejor=0 exclusión, 1=peor=4 exclusión)
        const value = sp !== undefined && sp !== null ? 5 - sp : 0;
        return {
            subject: getShortLabel(dim),
            fullTitle: dim.title,
            value: parseFloat(value.toFixed(2)),
            fullMark: 4
        };
    });

    // Datos para la gráfica de valoración objetiva (basada en indicadores)
    const objectiveScores = ScoringService.calculateObjectiveValuation(answers, dimensions);
    const objectiveChartData = Object.values(dimensions).map(dim => ({
        subject: getShortLabel(dim),
        fullTitle: dim.title,
        value: parseFloat((objectiveScores[dim.id] || 0).toFixed(2)),
        fullMark: 4
    }));

    // Obtener todos los riesgos identificados por dimensión
    const getIdentifiedRisks = () => {
        const risks = [];
        Object.values(dimensions).forEach(dim => {
            const dimAnswers = answers[dim.id] || {};
            if (dimAnswers.risks) {
                dim.risks?.forEach(risk => {
                    if (dimAnswers.risks[risk.id] === true) {
                        risks.push({
                            ...risk,
                            dimensionId: dim.id,
                            dimensionTitle: dim.title,
                            dimensionShort: getShortLabel(dim)
                        });
                    }
                });
            }
        });
        return risks;
    };

    const identifiedRisks = getIdentifiedRisks();

    // Obtener potencialidades y recursos por dimensión
    const getPotentialities = () => {
        const potentialities = [];
        Object.values(dimensions).forEach(dim => {
            const dimAnswers = answers[dim.id] || {};
            const checkedPotentialities = [];

            // Recoger potencialidades predefinidas marcadas
            if (dimAnswers.potentialitiesChecked && dim.potentialities) {
                dim.potentialities.forEach(pot => {
                    if (dimAnswers.potentialitiesChecked[pot.id] === true) {
                        checkedPotentialities.push(pot.label);
                    }
                });
            }

            // Incluir si hay potencialidades marcadas o notas
            const hasChecked = checkedPotentialities.length > 0;
            const hasNotes = dimAnswers.potentialitiesNotes && dimAnswers.potentialitiesNotes.trim();
            // También compatibilidad con el campo antiguo
            const hasOldText = dimAnswers.potentialities && dimAnswers.potentialities.trim();

            if (hasChecked || hasNotes || hasOldText) {
                potentialities.push({
                    dimensionId: dim.id,
                    dimensionTitle: dim.title,
                    dimensionShort: getShortLabel(dim),
                    checkedItems: checkedPotentialities,
                    notes: dimAnswers.potentialitiesNotes || dimAnswers.potentialities || ''
                });
            }
        });
        return potentialities;
    };

    const potentialities = getPotentialities();

    // Componente de gráfica de radar reutilizable
    const RadarChartComponent = ({ data, title, description, color, icon: Icon }) => (
        <div className="card mb-8">
            <h3 className="section-title">
                <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color }} />
                <Icon size={20} style={{ color }} className="ml-2" />
                {title}
            </h3>
            <p className="text-sm text-slate-500 mb-4 ml-6">{description}</p>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Radar
                            name="Nivel"
                            dataKey="value"
                            stroke={color}
                            fill={color}
                            fillOpacity={0.4}
                            strokeWidth={2}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                padding: '12px'
                            }}
                            formatter={(value, name, props) => [value.toFixed(2), props.payload.fullTitle]}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in pb-12">
            {/* Header */}
            <header className="mb-10 text-center">
                {/* Tool Badge */}
                {tool && (
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-sm"
                        style={{
                            backgroundColor: `${toolColor}15`,
                            color: toolColor,
                            border: `1px solid ${toolColor}30`
                        }}
                    >
                        <Wrench size={16} />
                        <span>Herramienta: {toolName}</span>
                    </div>
                )}
                <div className="mt-2">
                    <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                        Resultados del Análisis
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Informe de Diagnóstico</h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    Resumen integral multidimensional de la situación de exclusión social
                </p>
                {currentCase && (
                    <p className="text-sm text-slate-400 mt-2">
                        Expediente: <span className="font-medium text-slate-600">{currentCase.name}</span>
                        {currentCase.createdAt && (
                            <> · Creado: {new Date(currentCase.createdAt).toLocaleDateString('es-ES')}</>
                        )}
                    </p>
                )}
            </header>

            {/* ISES Score Card */}
            <div className="card mb-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={20} className="text-teal-500" />
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Índice Sintético (ISES)</h3>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <span className="text-6xl font-black text-slate-900">{isesScore}</span>
                            <span className="text-2xl font-bold" style={{ color: isesLevel.color }}>
                                {isesLevel.label}
                            </span>
                        </div>
                        <p className="mt-4 text-slate-500 text-sm">
                            Puntuación global calculada como media ponderada de las {Object.keys(dimensions).length} dimensiones.
                        </p>
                    </div>

                    <div className="flex items-center justify-center">
                        <div
                            className="text-center p-6 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => setShowRisksDetail(!showRisksDetail)}
                        >
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Shield size={20} className={riskCount > 0 ? 'text-red-500' : 'text-emerald-500'} />
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Riesgos Críticos Identificados</span>
                            </div>
                            <span className={`text-5xl font-black ${riskCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {riskCount}
                            </span>
                            <p className="text-xs text-slate-400 mt-1">
                                {riskCount > 0 ? 'Click para ver detalle' : 'Sin riesgos detectados'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Risks Section (Collapsible) */}
            {showRisksDetail && identifiedRisks.length > 0 && (
                <div className="card mb-8 border-l-4 border-red-400 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={20} className="text-red-500" />
                        <h3 className="text-lg font-bold text-slate-900">Detalle de Riesgos Críticos Identificados</h3>
                    </div>
                    <div className="space-y-3">
                        {Object.values(dimensions).map(dim => {
                            const dimRisks = identifiedRisks.filter(r => r.dimensionId === dim.id);
                            if (dimRisks.length === 0) return null;

                            return (
                                <div key={dim.id} className="p-4 rounded-xl bg-red-50/50">
                                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                                            {getShortLabel(dim)}
                                        </span>
                                        {dim.title}
                                    </h4>
                                    <ul className="space-y-1 ml-4">
                                        {dimRisks.map(risk => (
                                            <li key={risk.id} className="flex items-center gap-2 text-sm text-slate-700">
                                                <AlertTriangle size={14} className="text-red-500 shrink-0" />
                                                {risk.label}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Alerts Section */}
            {alerts.length > 0 && (
                <div className="mb-8">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                        <AlertCircle size={20} className="text-red-500" />
                        Alertas del Sistema
                    </h3>
                    <div className="space-y-4">
                        {alerts.map(alert => (
                            <div
                                key={alert.id}
                                className={`p-5 rounded-2xl border-l-4 ${alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                                    alert.severity === 'high' ? 'bg-orange-50 border-orange-500' :
                                        'bg-amber-50 border-amber-500'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle size={20} className={
                                            alert.severity === 'critical' ? 'text-red-600' :
                                                alert.severity === 'high' ? 'text-orange-600' :
                                                    'text-amber-600'
                                        } />
                                        <div>
                                            <h4 className="font-bold text-slate-900">{alert.title}</h4>
                                            <p className="text-slate-700 text-sm mt-1">{alert.description}</p>
                                        </div>
                                    </div>
                                    <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase ${alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                                        alert.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                                            'bg-amber-200 text-amber-800'
                                        }`}>
                                        {alert.severity === 'critical' ? 'Crítica' : alert.severity === 'high' ? 'Alta' : 'Media'}
                                    </span>
                                </div>
                                <div className="mt-4 p-3 rounded-xl bg-white/60 text-sm text-slate-600">
                                    💡 <strong>Acción:</strong> {alert.action}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Potentialities Section (Enfoque Apreciativo) */}
            {potentialities.length > 0 && (
                <div className="card mb-8 border-l-4 border-emerald-400 bg-gradient-to-r from-emerald-50/50 to-white">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={20} className="text-emerald-500" />
                        <h3 className="text-lg font-bold text-slate-900">Potencialidades y Recursos Identificados</h3>
                        <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                            {potentialities.reduce((acc, p) => acc + p.checkedItems.length, 0)} identificadas
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">
                        Fortalezas, capacidades y recursos detectados durante la evaluación (enfoque apreciativo).
                    </p>
                    <div className="space-y-4">
                        {potentialities.map(pot => (
                            <div key={pot.dimensionId} className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">
                                        {pot.dimensionShort}
                                    </span>
                                    {pot.dimensionTitle}
                                </h4>
                                {/* Checked potentialities as badges */}
                                {pot.checkedItems.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {pot.checkedItems.map((item, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium"
                                            >
                                                <Sparkles size={12} />
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {/* Additional notes */}
                                {pot.notes && pot.notes.trim() && (
                                    <p className="text-sm text-slate-700 ml-1 italic border-l-2 border-emerald-200 pl-3">
                                        {pot.notes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Section: Three Radar Charts */}
            <div className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-6">
                    <BarChart3 size={24} className="text-teal-500" />
                    Análisis Multidimensional Comparativo
                </h3>
                <p className="text-slate-500 mb-6">
                    Comparación de tres perspectivas de evaluación: la valoración técnica del profesional,
                    la autopercepción del usuario y el cálculo objetivo basado en los indicadores recogidos.
                </p>
            </div>

            {/* Radar Chart 1: Technical Valuation */}
            <RadarChartComponent
                data={technicalChartData}
                title="Valoración Técnica del Profesional"
                description="Puntuación asignada por el técnico evaluador basada en su análisis profesional de cada dimensión (escala 0-4)."
                color="#0d9488"
                icon={Eye}
            />

            {/* Radar Chart 2: Self Perception */}
            <RadarChartComponent
                data={selfPerceptionChartData}
                title="Autopercepción del Usuario"
                description="Cómo percibe el propio usuario su situación en cada dimensión. Escala invertida: valores más altos indican mayor exclusión percibida."
                color="#f59e0b"
                icon={User}
            />

            {/* Radar Chart 3: Objective Valuation */}
            <RadarChartComponent
                data={objectiveChartData}
                title="Valoración Objetiva (Indicadores)"
                description="Cálculo automático basado en las respuestas a los indicadores específicos y los riesgos identificados en cada dimensión."
                color="#8b5cf6"
                icon={BarChart3}
            />

            {/* Dimension Details */}
            <div className="card">
                <h3 className="section-title">
                    <div className="w-1 h-5 rounded-full bg-teal-500" />
                    Detalle por Dimensión
                </h3>
                <div className="space-y-4">
                    {Object.values(dimensions).map(dim => {
                        const val = answers[dim.id]?.valuation || 0;
                        const level = ScoringService.LEVELS[val];
                        const percentage = (val / 4) * 100;
                        const selfPerception = answers[dim.id]?.selfPerception;
                        const objectiveScore = objectiveScores[dim.id] || 0;
                        const dimRisks = identifiedRisks.filter(r => r.dimensionId === dim.id);
                        const hasPotentiality = answers[dim.id]?.potentialities?.trim();

                        return (
                            <div key={dim.id} className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-900">{dim.title}</h4>
                                            {dimRisks.length > 0 && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                                                    {dimRisks.length} riesgo{dimRisks.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {hasPotentiality && (
                                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full flex items-center gap-1">
                                                    <Sparkles size={10} /> Recursos
                                                </span>
                                            )}
                                        </div>
                                        {dim.description && (
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dim.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%`, backgroundColor: level.color }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold" style={{ color: level.color }}>
                                                {level.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Valoración técnica */}
                                        <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm" title="Valoración técnica">
                                            <span className="text-xl font-black text-slate-900">{val}</span>
                                            <span className="text-[8px] font-bold text-teal-500 uppercase">Técnica</span>
                                        </div>
                                        {/* Autopercepción */}
                                        <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm" title="Autopercepción">
                                            <span className="text-xl font-black text-slate-900">{selfPerception || '-'}</span>
                                            <span className="text-[8px] font-bold text-amber-500 uppercase">Auto</span>
                                        </div>
                                        {/* Objetiva */}
                                        <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm" title="Valoración objetiva">
                                            <span className="text-xl font-black text-slate-900">{objectiveScore.toFixed(1)}</span>
                                            <span className="text-[8px] font-bold text-purple-500 uppercase">Obj.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
