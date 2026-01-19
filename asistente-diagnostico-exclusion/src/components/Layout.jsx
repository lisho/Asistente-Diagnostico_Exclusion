import React, { useState } from 'react';
import {
    Wallet, Home, HeartPulse, Brain, GraduationCap, Users, Vote, Scale,
    ArrowLeft, Edit2, FileText, Menu, ChevronLeft, ChevronRight as ChevronRightIcon,
    CheckCircle2, PanelLeftClose, PanelLeft
} from 'lucide-react';

const MENU_ITEMS = [
    { id: 'dim1', label: 'Económica y Laboral', shortLabel: 'Económica', icon: Wallet, color: 'text-emerald-500', bgColor: 'bg-emerald-500' },
    { id: 'dim2', label: 'Vivienda y Hábitat', shortLabel: 'Vivienda', icon: Home, color: 'text-blue-500', bgColor: 'bg-blue-500' },
    { id: 'dim3', label: 'Salud Física', shortLabel: 'S. Física', icon: HeartPulse, color: 'text-rose-500', bgColor: 'bg-rose-500' },
    { id: 'dim4', label: 'Salud Mental', shortLabel: 'S. Mental', icon: Brain, color: 'text-purple-500', bgColor: 'bg-purple-500' },
    { id: 'dim5', label: 'Educación', shortLabel: 'Educación', icon: GraduationCap, color: 'text-amber-500', bgColor: 'bg-amber-500' },
    { id: 'dim6', label: 'Relaciones Sociales', shortLabel: 'Redes', icon: Users, color: 'text-cyan-500', bgColor: 'bg-cyan-500' },
    { id: 'dim7', label: 'Participación', shortLabel: 'Política', icon: Vote, color: 'text-indigo-500', bgColor: 'bg-indigo-500' },
    { id: 'dim8', label: 'Situación Legal', shortLabel: 'Legal', icon: Scale, color: 'text-slate-600', bgColor: 'bg-slate-600' },
    { id: 'report', label: 'Informe Final', shortLabel: 'Informe', icon: FileText, color: 'text-indigo-600', bgColor: 'bg-indigo-600' },
];

export function Layout({ children, currentView, onViewChange, caseTitle, onTitleChange, onBack, currentCase }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [editingTitle, setEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const startEdit = () => { setTempTitle(caseTitle); setEditingTitle(true); };
    const saveEdit = () => { if (tempTitle.trim()) onTitleChange(tempTitle); setEditingTitle(false); };

    // Dashboard layout (no sidebar)
    if (!currentCase) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">
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
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-white">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-all"
                        title="Volver al Dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    {sidebarOpen && (
                        <h1 className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Asistente DX
                        </h1>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-all hidden lg:flex"
                        title={sidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
                    >
                        {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {MENU_ITEMS.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        const isReport = item.id === 'report';

                        return (
                            <div key={item.id}>
                                {isReport && <div className="my-3 border-t border-slate-200" />}
                                <button
                                    onClick={() => { onViewChange(item.id); setMobileMenuOpen(false); }}
                                    title={!sidebarOpen ? item.label : undefined}
                                    className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                    ${isActive
                                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }
                    ${!sidebarOpen ? 'justify-center' : ''}
                  `}
                                >
                                    <div className={`flex-shrink-0 ${isActive ? '' : ''}`}>
                                        <Icon size={20} className={isActive ? 'text-white' : item.color} />
                                    </div>
                                    {sidebarOpen && (
                                        <>
                                            <span className={`flex-1 text-left text-sm font-medium truncate ${isActive ? 'font-semibold' : ''}`}>
                                                {item.label}
                                            </span>
                                            {isActive && <CheckCircle2 size={16} className="opacity-60" />}
                                        </>
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {!sidebarOpen && (
                                        <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                                            {item.label}
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
                            <p className="text-xs font-semibold text-slate-500">v1.0</p>
                        </div>
                    ) : (
                        <p className="text-xs text-center font-bold text-slate-400">v1.0</p>
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
                        className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 lg:hidden"
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
                                className="text-lg sm:text-xl font-bold text-slate-800 border-2 border-indigo-300 rounded-lg px-3 py-1 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 max-w-xs"
                            />
                        ) : (
                            <button onClick={startEdit} className="flex items-center gap-2 group min-w-0">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                                    {caseTitle}
                                </h2>
                                <Edit2 size={16} className="flex-shrink-0 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            </button>
                        )}
                    </div>

                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-mono text-slate-600">REF: {currentCase.id.slice(0, 8).toUpperCase()}</span>
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
