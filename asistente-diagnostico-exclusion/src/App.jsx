import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import { DimensionForm } from './components/DimensionForm'
import { DiagnosisReport } from './components/DiagnosisReport'
import { AdminPanel } from './components/AdminPanel'
import { ConfirmationModal } from './components/ConfirmationModal'
import { getDimensionsConfig } from './data/dimensionsService'
import { getActiveTools, getToolById, filterDimensionsByTool } from './data/toolsService'
import { StorageService } from './services/StorageService'
import {
  Plus, FileText, Trash2, Clock, ChevronRight, FolderOpen, Settings,
  X, Zap, Briefcase, Home, Heart, FileCheck, Wrench, Check
} from 'lucide-react'
import './App.css'

const ICON_MAP = {
  FileCheck: FileCheck,
  Zap: Zap,
  Briefcase: Briefcase,
  Home: Home,
  Heart: Heart,
  Wrench: Wrench
};

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentCase, setCurrentCase] = useState(null);
  const [answers, setAnswers] = useState({});
  const [caseList, setCaseList] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, caseId: null });
  const [dimensions, setDimensions] = useState(() => getDimensionsConfig());
  const [showToolSelector, setShowToolSelector] = useState(false);

  // Refresh dimensions when returning from admin
  const refreshDimensions = () => setDimensions(getDimensionsConfig());

  useEffect(() => { loadCases(); }, []);

  const loadCases = () => setCaseList(StorageService.getAll());

  // Get dimensions filtered by the tool used for current case
  const getFilteredDimensions = () => {
    if (!currentCase?.toolId) return dimensions;
    const tool = getToolById(currentCase.toolId);
    return filterDimensionsByTool(dimensions, tool);
  };

  const createNewDiagnosis = (toolId) => {
    const tool = getToolById(toolId);
    const newCase = {
      id: crypto.randomUUID(),
      title: 'Nuevo Diagnóstico',
      toolId: toolId,
      toolName: tool.name,
      toolColor: tool.color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answers: {}
    };
    StorageService.save(newCase);
    openCase(newCase);
    setShowToolSelector(false);
  };

  const openCase = (c) => {
    setCurrentCase(c);
    setAnswers(c.answers || {});
    // Navigate to first enabled dimension
    const tool = getToolById(c.toolId || 'complete');
    const filteredDims = filterDimensionsByTool(dimensions, tool);
    const firstDimId = Object.keys(filteredDims)[0] || 'dim1';
    setCurrentView(firstDimId);
  };

  const handleDeleteClick = (e, id) => { e.stopPropagation(); setDeleteModal({ isOpen: true, caseId: id }); };

  const confirmDelete = () => {
    if (deleteModal.caseId) {
      StorageService.delete(deleteModal.caseId);
      loadCases();
      if (currentCase?.id === deleteModal.caseId) { setCurrentCase(null); setCurrentView('dashboard'); }
    }
    setDeleteModal({ isOpen: false, caseId: null });
  };

  const handleAnswerChange = (dimId, fieldId, value) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [dimId]: { ...prev[dimId], [fieldId]: value } };
      if (currentCase) {
        const updated = { ...currentCase, answers: newAnswers, updatedAt: new Date().toISOString() };
        StorageService.save(updated);
        setCurrentCase(updated);
      }
      return newAnswers;
    });
  };

  const handleTitleChange = (newTitle) => {
    if (currentCase) {
      const updated = { ...currentCase, title: newTitle };
      setCurrentCase(updated);
      StorageService.save(updated);
      loadCases();
    }
  };

  const returnToDashboard = () => { setCurrentView('dashboard'); setCurrentCase(null); loadCases(); };

  // Tool Selector Modal
  const ToolSelectorModal = () => {
    const activeTools = getActiveTools();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowToolSelector(false)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-100" style={{ background: 'linear-gradient(135deg, rgba(0,168,168,0.05) 0%, white 100%)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Nuevo Diagnóstico</h3>
                <p className="text-sm text-slate-500">Selecciona la herramienta de diagnóstico a utilizar</p>
              </div>
              <button onClick={() => setShowToolSelector(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {activeTools.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No hay herramientas activas. Ve a Administración para activar herramientas.
              </div>
            ) : (
              activeTools.map(tool => {
                const Icon = ICON_MAP[tool.icon] || FileCheck;
                return (
                  <button
                    key={tool.id}
                    onClick={() => createNewDiagnosis(tool.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 transition-all text-left group"
                  >
                    <div
                      className="p-3 rounded-xl transition-transform group-hover:scale-110"
                      style={{ background: `${tool.color}20` }}
                    >
                      <Icon size={24} style={{ color: tool.color }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 group-hover:text-teal-700">{tool.name}</h4>
                      <p className="text-sm text-slate-500">{tool.description}</p>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                  </button>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
            <button onClick={() => setShowToolSelector(false)} className="text-sm text-slate-500 hover:text-slate-700">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="min-h-[80vh] flex flex-col">
      {/* Hero Header */}
      <div className="text-center pb-12 pt-8">
        <span className="inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full mb-4"
          style={{ background: 'rgba(0, 168, 168, 0.15)', color: '#03444A' }}>
          Marco Integral de Diagnóstico
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
          Gestión de Diagnósticos
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Sistema de diagnóstico multidimensional para situaciones de exclusión social
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex justify-center gap-4 mb-10">
        <button onClick={() => setShowToolSelector(true)} className="btn btn-primary text-base px-8 py-4 gap-3">
          <Plus size={22} strokeWidth={2.5} />
          Crear Nuevo Diagnóstico
        </button>
        <button
          onClick={() => setCurrentView('admin')}
          className="btn btn-secondary text-base px-6 py-4 gap-2"
        >
          <Settings size={20} />
          Administración
        </button>
      </div>

      {/* Cases Grid */}
      {caseList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <FolderOpen size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No hay diagnósticos</h3>
          <p className="text-slate-500 mb-6 max-w-sm">
            Comienza creando tu primer diagnóstico seleccionando una herramienta.
          </p>
          <button onClick={() => setShowToolSelector(true)} className="font-semibold hover:opacity-80" style={{ color: '#00A8A8' }}>
            Crear el primero →
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {caseList.map(c => {
            const Icon = ICON_MAP[c.toolIcon] || FileText;
            return (
              <div
                key={c.id}
                onClick={() => openCase(c)}
                className="card card-hover flex items-center gap-5 cursor-pointer group"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{
                    background: c.toolColor ? `linear-gradient(135deg, ${c.toolColor} 0%, ${c.toolColor}dd 100%)` : 'linear-gradient(135deg, #00A8A8 0%, #03444A 100%)',
                    boxShadow: `0 8px 16px ${c.toolColor || '#00A8A8'}30`
                  }}
                >
                  <FileText size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                    {c.title || 'Sin título'}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                    {c.toolName && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: `${c.toolColor || '#00A8A8'}15`, color: c.toolColor || '#00A8A8' }}>
                          {c.toolName}
                        </span>
                      </>
                    )}
                    <span className="text-slate-300">•</span>
                    <span className="font-mono">{c.id.slice(0, 8)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDeleteClick(e, c.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0, 168, 168, 0.1)' }}>
                    <ChevronRight size={18} style={{ color: '#00A8A8' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const handleAdminBack = () => {
    refreshDimensions();
    returnToDashboard();
  };

  const filteredDimensions = getFilteredDimensions();

  const renderContent = () => {
    if (currentView === 'dashboard') return renderDashboard();
    if (currentView === 'admin') return <AdminPanel onBack={handleAdminBack} />;
    if (currentView === 'report') return <DiagnosisReport dimensions={filteredDimensions} answers={answers} currentCase={currentCase} />;
    const dim = filteredDimensions[currentView];
    if (dim) return <DimensionForm dimension={dim} answers={answers} onChange={handleAnswerChange} />;
    return <div>Vista no encontrada</div>;
  };

  return (
    <Layout
      currentView={currentView}
      onViewChange={setCurrentView}
      caseTitle={currentCase?.title}
      onTitleChange={handleTitleChange}
      onBack={returnToDashboard}
      currentCase={currentCase}
      dimensions={filteredDimensions}
      answers={answers}
    >
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, caseId: null })}
        onConfirm={confirmDelete}
        title="Eliminar Diagnóstico"
        message="¿Está seguro de eliminar este diagnóstico? Esta acción no se puede deshacer."
      />
      {showToolSelector && <ToolSelectorModal />}
      {renderContent()}
    </Layout>
  );
}

export default App
