import React, { useState, useMemo } from 'react';
import {
    Wallet, Home, HeartPulse, Brain, GraduationCap, Users, Vote, Scale,
    ArrowLeft, Edit2, FileText, Menu, ChevronLeft,
    CheckCircle2, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { evaluateDependency } from '../data/dimensions';

const MENU_ITEMS = [
    { id: 'dim1', label: 'Económica y Laboral', shortLabel: 'Económica', icon: Wallet },
    { id: 'dim2', label: 'Vivienda y Hábitat', shortLabel: 'Vivienda', icon: Home },
    { id: 'dim3', label: 'Salud Física', shortLabel: 'S. Física', icon: HeartPulse },
    { id: 'dim4', label: 'Salud Mental', shortLabel: 'S. Mental', icon: Brain },
    { id: 'dim5', label: 'Educación', shortLabel: 'Educación', icon: GraduationCap },
    { id: 'dim6', label: 'Relaciones Sociales', shortLabel: 'Redes', icon: Users },
    { id: 'dim7', label: 'Participación', shortLabel: 'Política', icon: Vote },
    { id: 'dim8', label: 'Situación Legal', shortLabel: 'Legal', icon: Scale },
    { id: 'report', label: 'Informe Final', shortLabel: 'Informe', icon: FileText },
];

// Calculate completion percentage for a dimension
function calculateDimensionProgress(dimension, dimensionAnswers) {
    if (!dimension?.subdimensions) return 0;

    let total = 0;
    let completed = 0;

    dimension.subdimensions.forEach(sub => {
        sub.indicators.forEach(ind => {
            // Check if indicator is visible
            if (ind.dependsOn && !evaluateDependency(ind.dependsOn, dimensionAnswers)) return;

            total++;
            const val = dimensionAnswers?.[ind.id];
            if (val !== undefined && val !== '' && val !== null) completed++;
        });
    });

    return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function Layout({ children, currentView, onViewChange, caseTitle, onTitleChange, onBack, currentCase, dimensions, answers }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [editingTitle, setEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const startEdit = () => { setTempTitle(caseTitle); setEditingTitle(true); };
    const saveEdit = () => { if (tempTitle.trim()) onTitleChange(tempTitle); setEditingTitle(false); };

    // Get visible menu items based on available dimensions
    const visibleMenuItems = useMemo(() => {
        if (!dimensions) return MENU_ITEMS;
        return MENU_ITEMS.filter(item => {
            if (item.id === 'report') return true; // Always show report
            return dimensions[item.id] !== undefined;
        });
    }, [dimensions]);

    // Calculate progress for each dimension
    const progressByDimension = useMemo(() => {
        if (!dimensions || !answers) return {};
        const progress = {};
        visibleMenuItems.forEach(item => {
            if (item.id.startsWith('dim')) {
                const dim = dimensions[item.id];
                if (dim) {
                    const dimAnswers = answers[item.id] || {};
                    progress[item.id] = calculateDimensionProgress(dim, dimAnswers);
                }
            }
        });
        return progress;
    }, [dimensions, answers, visibleMenuItems]);

    // Overall progress
    const overallProgress = useMemo(() => {
        const values = Object.values(progressByDimension);
        if (values.length === 0) return 0;
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }, [progressByDimension]);

    // Dashboard layout (no sidebar)
    if (!currentCase) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-100">
            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50
        bg-white border-r border-slate-200 shadow-xl lg:shadow-none
        flex flex-col transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-72' : 'w-[72px]'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100"
                    style={{ background: 'linear-gradient(135deg, rgba(0,168,168,0.05) 0%, white 100%)' }}>
                    <button
                        onClick={onBack}
                        className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
                        title="Volver al Dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    {sidebarOpen && (
                        <h1 className="font-extrabold text-lg text-gradient-brand">
                            Asistente DX
                        </h1>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all hidden lg:flex"
                        title={sidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
                    >
                        {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
                    </button>
                </div>

                {/* Overall Progress */}
                {sidebarOpen && (
                    <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progreso Total</span>
                            <span className="text-sm font-bold" style={{ color: overallProgress === 100 ? '#00A8A8' : '#E66414' }}>
                                {overallProgress}%
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className={overallProgress === 100 ? 'progress-fill' : 'progress-fill-accent h-full rounded-full transition-all duration-500'}
                                style={{ width: `${overallProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {visibleMenuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        const isReport = item.id === 'report';
                        const progress = progressByDimension[item.id];
                        const isComplete = progress === 100;

                        return (
                            <div key={item.id}>
                                {isReport && <div className="my-3 border-t border-slate-200" />}
                                <button
                                    onClick={() => { onViewChange(item.id); setMobileMenuOpen(false); }}
                                    title={!sidebarOpen ? `${item.label}${progress !== undefined ? ` (${progress}%)` : ''}` : undefined}
                                    className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                    ${isActive
                                            ? 'text-white shadow-lg'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }
                    ${!sidebarOpen ? 'justify-center' : ''}
                  `}
                                    style={isActive ? {
                                        background: 'linear-gradient(135deg, #00A8A8 0%, #03444A 100%)',
                                        boxShadow: '0 4px 14px rgba(0, 168, 168, 0.35)'
                                    } : {}}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Icon size={20} className={isActive ? 'text-white' : isComplete ? 'text-teal-500' : 'text-slate-500'} />
                                        {/* Progress ring when collapsed */}
                                        {!sidebarOpen && progress !== undefined && !isReport && (
                                            <svg className="absolute -top-1 -right-1 w-3 h-3" viewBox="0 0 12 12">
                                                <circle cx="6" cy="6" r="5" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                                                <circle
                                                    cx="6" cy="6" r="5" fill="none"
                                                    stroke={isComplete ? '#00A8A8' : '#FF924D'}
                                                    strokeWidth="2"
                                                    strokeDasharray={`${progress * 0.314} 31.4`}
                                                    transform="rotate(-90 6 6)"
                                                />
                                            </svg>
                                        )}
                                    </div>

                                    {sidebarOpen && (
                                        <>
                                            <span className={`flex-1 text-left text-sm font-medium truncate ${isActive ? 'font-semibold' : ''}`}>
                                                {item.label}
                                            </span>

                                            {/* Progress indicator */}
                                            {progress !== undefined && !isReport && (
                                                <div className="flex items-center gap-2">
                                                    {isComplete ? (
                                                        <CheckCircle2 size={16} className={isActive ? 'text-white/80' : 'text-teal-500'} />
                                                    ) : (
                                                        <span className={`text-xs font-semibold ${isActive ? 'text-white/80' : ''}`}
                                                            style={{ color: isActive ? 'rgba(255,255,255,0.8)' : '#FF924D' }}>
                                                            {progress}%
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {isReport && isActive && <CheckCircle2 size={16} className="text-white/60" />}
                                        </>
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {!sidebarOpen && (
                                        <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                                            {item.label}
                                            {progress !== undefined && !isReport && (
                                                <span className="ml-2 px-1.5 py-0.5 rounded text-xs"
                                                    style={{ background: isComplete ? 'rgba(0,168,168,0.2)' : 'rgba(255,146,77,0.2)', color: isComplete ? '#9AD3DA' : '#FF924D' }}>
                                                    {progress}%
                                                </span>
                                            )}
                                            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                        </div>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    {sidebarOpen ? (
                        <div className="text-center">
                            <p className="text-xs text-slate-400 mb-1">Marco Integral de Diagnóstico</p>
                            <p className="text-xs font-semibold" style={{ color: '#00A8A8' }}>v1.0</p>
                        </div>
                    ) : (
                        <p className="text-xs text-center font-bold" style={{ color: '#00A8A8' }}>v1.0</p>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className={`
        flex-1 flex flex-col min-w-0 transition-all duration-300
        ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-[72px]'}
      `}>
                {/* Header */}
                <header className="h-16 sticky top-0 z-30 glass px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-teal-50 lg:hidden"
                    >
                        <Menu size={22} />
                    </button>

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {editingTitle ? (
                            <input
                                autoFocus
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                onBlur={saveEdit}
                                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                className="text-lg sm:text-xl font-bold text-slate-800 border-2 border-teal-300 rounded-lg px-3 py-1 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100 max-w-xs"
                            />
                        ) : (
                            <button onClick={startEdit} className="flex items-center gap-2 group min-w-0">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-800 group-hover:text-teal-600 transition-colors truncate">
                                    {caseTitle}
                                </h2>
                                <Edit2 size={16} className="flex-shrink-0 text-slate-400 group-hover:text-teal-500 transition-colors" />
                            </button>
                        )}
                    </div>

                    <div className="hidden sm:flex items-center gap-3">
                        {currentCase.toolName && (
                            <span className="px-3 py-1.5 rounded-lg text-xs font-bold"
                                style={{
                                    background: `${currentCase.toolColor || '#00A8A8'}15`,
                                    color: currentCase.toolColor || '#00A8A8'
                                }}>
                                {currentCase.toolName}
                            </span>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                            style={{ background: 'rgba(0,168,168,0.05)', borderColor: 'rgba(0,168,168,0.2)' }}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00A8A8' }} />
                            <span className="text-xs font-mono" style={{ color: '#03444A' }}>REF: {currentCase.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
                        <div className="animate-fade-in">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
