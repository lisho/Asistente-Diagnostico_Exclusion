import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100 text-red-600">
                            <AlertTriangle size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-slate-600 leading-relaxed">{message}</p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-5 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className="btn bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/25"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}
