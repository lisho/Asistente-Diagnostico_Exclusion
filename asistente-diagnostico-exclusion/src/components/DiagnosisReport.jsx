import React from 'react';
import { ScoringService } from '../services/ScoringService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, TrendingUp, Shield, AlertTriangle } from 'lucide-react';

export function DiagnosisReport({ dimensions, answers }) {
    const isesScore = ScoringService.calculateISES(answers, dimensions);
    const isesLevel = ScoringService.getISESLevel(isesScore);
    const alerts = ScoringService.getDetectedAlerts(answers);
    const riskCount = ScoringService.countTotalRisks(answers);

    const chartData = Object.values(dimensions).map(dim => ({
        subject: dim.title.split(' ')[0],
        fullTitle: dim.title,
        A: answers[dim.id]?.valuation || 0,
        fullMark: 4
    }));

    return (
        <div className="animate-fade-in pb-12">
            {/* Header */}
            <header className="mb-10 text-center">
                <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                    Resultados del Análisis
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Informe de Diagnóstico</h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    Resumen integral multidimensional de la situación de exclusión social
                </p>
            </header>

            {/* ISES Score Card */}
            <div className="card mb-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={20} className="text-indigo-500" />
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Índice Sintético (ISES)</h3>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <span className="text-6xl font-black text-slate-900">{isesScore}</span>
                            <span className="text-2xl font-bold" style={{ color: isesLevel.color }}>
                                {isesLevel.label}
                            </span>
                        </div>
                        <p className="mt-4 text-slate-500 text-sm">
                            Puntuación global calculada como media ponderada de las 8 dimensiones.
                        </p>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="text-center p-6 rounded-2xl bg-slate-50">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Shield size={20} className={riskCount > 0 ? 'text-red-500' : 'text-emerald-500'} />
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Riesgos Críticos</span>
                            </div>
                            <span className={`text-5xl font-black ${riskCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {riskCount}
                            </span>
                            <p className="text-xs text-slate-400 mt-1">indicadores detectados</p>
                        </div>
                    </div>
                </div>
            </div>

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

            {/* Radar Chart */}
            <div className="card mb-8">
                <h3 className="section-title">
                    <div className="w-1 h-5 rounded-full bg-indigo-500" />
                    Perfil Multidimensional
                </h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Radar
                                name="Nivel"
                                dataKey="A"
                                stroke="#4f46e5"
                                fill="#6366f1"
                                fillOpacity={0.5}
                                strokeWidth={2}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    padding: '12px'
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Dimension Details */}
            <div className="card">
                <h3 className="section-title">
                    <div className="w-1 h-5 rounded-full bg-indigo-500" />
                    Detalle por Dimensión
                </h3>
                <div className="space-y-4">
                    {Object.values(dimensions).map(dim => {
                        const val = answers[dim.id]?.valuation || 0;
                        const level = ScoringService.LEVELS[val];
                        const percentage = (val / 4) * 100;

                        return (
                            <div key={dim.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">{dim.title}</h4>
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
                                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                                    <span className="text-2xl font-black text-slate-900">{val}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Puntos</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
