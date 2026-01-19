import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import { DimensionForm } from './components/DimensionForm'
import { DiagnosisReport } from './components/DiagnosisReport'
import { AdminPanel } from './components/AdminPanel'
import { ConfirmationModal } from './components/ConfirmationModal'
import { getDimensionsConfig } from './data/dimensionsService'
import { StorageService } from './services/StorageService'
import { Plus, FileText, Trash2, Clock, ChevronRight, FolderOpen, Settings } from 'lucide-react'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentCase, setCurrentCase] = useState(null);
  const [answers, setAnswers] = useState({});
  const [caseList, setCaseList] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, caseId: null });
  const [dimensions, setDimensions] = useState(() => getDimensionsConfig());

  // Refresh dimensions when returning from admin
  const refreshDimensions = () => setDimensions(getDimensionsConfig());

  useEffect(() => { loadCases(); }, []);

  const loadCases = () => setCaseList(StorageService.getAll());

  const createNewCase = () => {
    const newCase = {
      id: crypto.randomUUID(),
      title: 'Nuevo Diagnóstico',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answers: {}
    };
    StorageService.save(newCase);
    openCase(newCase);
  };

  const openCase = (c) => { setCurrentCase(c); setAnswers(c.answers || {}); setCurrentView('dim1'); };

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

  const renderDashboard = () => (
    <div className="min-h-[80vh] flex flex-col">
      {/* Hero Header */}
      <div className="text-center pb-12 pt-8">
        <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
          Marco Integral de Diagnóstico
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
          Gestión de Expedientes
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Sistema de diagnóstico multidimensional para situaciones de exclusión social
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex justify-center gap-4 mb-10">
        <button onClick={createNewCase} className="btn btn-primary text-base px-8 py-4 gap-3">
          <Plus size={22} strokeWidth={2.5} />
          Crear Nuevo Expediente
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
          <h3 className="text-xl font-bold text-slate-700 mb-2">No hay expedientes</h3>
          <p className="text-slate-500 mb-6 max-w-sm">
            Comienza creando tu primer expediente para realizar un diagnóstico integral.
          </p>
          <button onClick={createNewCase} className="text-indigo-600 font-semibold hover:text-indigo-800">
            Crear el primero →
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {caseList.map(c => (
            <div
              key={c.id}
              onClick={() => openCase(c)}
              className="card card-hover flex items-center gap-5 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <FileText size={24} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                  {c.title || 'Sin título'}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </span>
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
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const handleAdminBack = () => {
    refreshDimensions();
    returnToDashboard();
  };

  const renderContent = () => {
    if (currentView === 'dashboard') return renderDashboard();
    if (currentView === 'admin') return <AdminPanel onBack={handleAdminBack} />;
    if (currentView === 'report') return <DiagnosisReport dimensions={dimensions} answers={answers} />;
    const dim = dimensions[currentView];
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
    >
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, caseId: null })}
        onConfirm={confirmDelete}
        title="Eliminar Expediente"
        message="¿Está seguro de eliminar este expediente? Esta acción no se puede deshacer."
      />
      {renderContent()}
    </Layout>
  );
}

export default App
