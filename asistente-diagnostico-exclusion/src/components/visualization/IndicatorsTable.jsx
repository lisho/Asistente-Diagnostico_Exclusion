import React, { useState, useMemo } from 'react';
import { Table, Search, ChevronUp, ChevronDown, Download, Filter, ArrowRight, Link2 } from 'lucide-react';
import { DIMENSIONS, getAllIndicators } from '../../data/dimensions';

// Color palette
const DIMENSION_COLORS = {
    dim1: { primary: '#00A8A8', name: 'Situación Económica y Laboral' },
    dim2: { primary: '#FF6B6B', name: 'Vivienda y Hábitat' },
    dim3: { primary: '#4ECDC4', name: 'Salud y Bienestar Físico' },
    dim4: { primary: '#9B59B6', name: 'Salud Mental y Bienestar Psicológico' },
    dim5: { primary: '#F39C12', name: 'Educación y Competencias' },
    dim6: { primary: '#3498DB', name: 'Relaciones Sociales, Familiares y Comunitarias' },
    dim7: { primary: '#E74C3C', name: 'Participación Ciudadana' },
    dim8: { primary: '#1ABC9C', name: 'Situación Legal y Administrativa' },
};

// Function to format dependency in a human-readable way
export function formatDependencyMessage(dependsOn, allIndicators) {
    if (!dependsOn) return null;

    const sourceIndicator = allIndicators.find(i => i.id === dependsOn.indicatorId);
    const sourceName = sourceIndicator?.label || dependsOn.indicatorId;

    const conditionText = {
        equals: 'sea igual a',
        notEquals: 'sea diferente de',
        contains: 'contenga',
        greaterThan: 'sea mayor que',
        lessThan: 'sea menor que',
        isEmpty: 'esté vacío',
        isNotEmpty: 'tenga algún valor',
        includes: 'incluya',
    };

    const formatValue = (value) => {
        if (value === true) return '"Sí"';
        if (value === false) return '"No"';
        if (Array.isArray(value)) return value.map(v => `"${v}"`).join(' o ');
        if (typeof value === 'string') return `"${value}"`;
        return String(value);
    };

    const condition = conditionText[dependsOn.condition] || dependsOn.condition;
    const valueStr = formatValue(dependsOn.value);

    return {
        summary: `Este indicador solo aparece si "${sourceName}" ${condition} ${valueStr}`,
        source: sourceName,
        sourceId: dependsOn.indicatorId,
        condition: condition,
        value: valueStr,
    };
}

export function IndicatorsTable({ filters }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'dimension', direction: 'asc' });
    const [expandedRow, setExpandedRow] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const allIndicators = useMemo(() => getAllIndicators(), []);

    // Build table data
    const tableData = useMemo(() => {
        const data = [];

        Object.entries(DIMENSIONS).forEach(([dimId, dim]) => {
            dim.subdimensions.forEach(sub => {
                sub.indicators.forEach(ind => {
                    data.push({
                        id: ind.id,
                        dimensionId: dimId,
                        dimension: dim.title,
                        subdimensionId: sub.id,
                        subdimension: sub.title,
                        label: ind.label || ind.id,
                        type: ind.type,
                        dependsOn: ind.dependsOn,
                        options: ind.options,
                        description: ind.description,
                        color: DIMENSION_COLORS[dimId]?.primary || '#00A8A8',
                        formattedDependency: formatDependencyMessage(ind.dependsOn, allIndicators),
                    });
                });
            });
        });

        return data;
    }, [allIndicators]);

    // Apply filters
    const filteredData = useMemo(() => {
        let result = tableData;

        // Apply dimension filter
        if (filters?.selectedDimension) {
            result = result.filter(item => item.dimensionId === filters.selectedDimension);
        }

        // Apply subdimension filter
        if (filters?.selectedSubdimension) {
            result = result.filter(item => item.subdimensionId === filters.selectedSubdimension);
        }

        // Apply dependencies filter
        if (filters?.showDependencies) {
            result = result.filter(item => item.dependsOn);
        }

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.id.toLowerCase().includes(term) ||
                item.label.toLowerCase().includes(term) ||
                item.dimension.toLowerCase().includes(term) ||
                item.subdimension.toLowerCase().includes(term)
            );
        }

        return result;
    }, [tableData, filters, searchTerm]);

    // Sort data
    const sortedData = useMemo(() => {
        const sorted = [...filteredData];
        sorted.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [filteredData, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) {
            return <ChevronUp size={14} className="text-slate-300" />;
        }
        return sortConfig.direction === 'asc'
            ? <ChevronUp size={14} className="text-teal-600" />
            : <ChevronDown size={14} className="text-teal-600" />;
    };

    const typeLabels = {
        select: 'Selección',
        radio: 'Opción única',
        boolean: 'Sí/No',
        number: 'Número',
        text: 'Texto',
        scale: 'Escala',
        checkbox: 'Múltiple',
        date: 'Fecha',
    };

    const exportToCSV = () => {
        const headers = ['Código', 'Indicador', 'Dimensión', 'Subdimensión', 'Tipo', 'Tiene Dependencia', 'Dependencia'];
        const rows = sortedData.map(item => [
            item.id,
            `"${item.label}"`,
            `"${item.dimension}"`,
            `"${item.subdimension}"`,
            typeLabels[item.type] || item.type,
            item.dependsOn ? 'Sí' : 'No',
            item.formattedDependency?.summary || ''
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        // Add BOM for Excel utf-8 compatibility
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'indicadores_diagnostico.csv';
        link.click();
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-100 rounded-lg">
                            <Table size={20} className="text-teal-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Tabla de Indicadores</h3>
                            <p className="text-sm text-slate-500">
                                {filteredData.length} de {tableData.length} indicadores
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 md:w-64">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar indicador..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        {/* Export */}
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors text-sm font-medium"
                        >
                            <Download size={16} />
                            <span className="hidden md:inline">Exportar CSV</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th
                                onClick={() => handleSort('id')}
                                className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                            >
                                <div className="flex items-center gap-1">
                                    Código <SortIcon column="id" />
                                </div>
                            </th>
                            <th
                                onClick={() => handleSort('label')}
                                className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                            >
                                <div className="flex items-center gap-1">
                                    Indicador <SortIcon column="label" />
                                </div>
                            </th>
                            <th
                                onClick={() => handleSort('dimension')}
                                className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                            >
                                <div className="flex items-center gap-1">
                                    Dimensión <SortIcon column="dimension" />
                                </div>
                            </th>
                            <th
                                onClick={() => handleSort('subdimension')}
                                className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                            >
                                <div className="flex items-center gap-1">
                                    Subdimensión <SortIcon column="subdimension" />
                                </div>
                            </th>
                            <th
                                onClick={() => handleSort('type')}
                                className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                            >
                                <div className="flex items-center gap-1">
                                    Tipo <SortIcon column="type" />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                                <div className="flex items-center justify-center gap-1">
                                    <Link2 size={14} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedData.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <tr
                                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedRow === item.id ? 'bg-teal-50' : ''
                                        }`}
                                    onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                                >
                                    <td className="px-4 py-3">
                                        <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                                            {item.id}
                                        </code>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm font-medium text-slate-800 line-clamp-2">
                                            {item.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ background: item.color }}
                                            />
                                            <span className="text-sm text-slate-600 line-clamp-1">
                                                {item.dimension}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-slate-600 line-clamp-1">
                                            {item.subdimension}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                                            {typeLabels[item.type] || item.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {item.dependsOn && (
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600" title="Tiene dependencia">
                                                ⚡
                                            </span>
                                        )}
                                    </td>
                                </tr>

                                {/* Expanded Row - Dependency Details */}
                                {expandedRow === item.id && (
                                    <tr className="bg-slate-50">
                                        <td colSpan="6" className="px-4 py-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Description */}
                                                {item.description && (
                                                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Descripción</p>
                                                        <p className="text-sm text-slate-700">{item.description}</p>
                                                    </div>
                                                )}

                                                {/* Options */}
                                                {item.options && item.options.length > 0 && (
                                                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Opciones de respuesta</p>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {item.options.slice(0, 5).map((opt, i) => (
                                                                <span key={i} className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                                                    {typeof opt === 'object' ? opt.label : opt}
                                                                </span>
                                                            ))}
                                                            {item.options.length > 5 && (
                                                                <span className="text-xs text-slate-400">+{item.options.length - 5} más</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dependency - Human Readable */}
                                                {item.formattedDependency && (
                                                    <div className="md:col-span-2 bg-orange-50 rounded-lg p-4 border border-orange-200">
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-orange-100 rounded-lg">
                                                                <ArrowRight size={16} className="text-orange-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-bold text-orange-700 uppercase mb-2">
                                                                    Condición de Visibilidad
                                                                </p>
                                                                <p className="text-sm text-orange-800 font-medium mb-3">
                                                                    {item.formattedDependency.summary}
                                                                </p>
                                                                <div className="grid grid-cols-3 gap-3 text-xs">
                                                                    <div className="bg-white/70 rounded-lg p-2">
                                                                        <span className="text-orange-600 font-semibold">Depende de:</span>
                                                                        <p className="text-orange-800 font-medium mt-0.5">{item.formattedDependency.sourceId}</p>
                                                                    </div>
                                                                    <div className="bg-white/70 rounded-lg p-2">
                                                                        <span className="text-orange-600 font-semibold">Condición:</span>
                                                                        <p className="text-orange-800 font-medium mt-0.5">{item.formattedDependency.condition}</p>
                                                                    </div>
                                                                    <div className="bg-white/70 rounded-lg p-2">
                                                                        <span className="text-orange-600 font-semibold">Valor requerido:</span>
                                                                        <p className="text-orange-800 font-medium mt-0.5">{item.formattedDependency.value}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedData.length)} de {sortedData.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let page;
                            if (totalPages <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`min-w-[36px] py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                        ? 'bg-teal-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {paginatedData.length === 0 && (
                <div className="p-12 text-center">
                    <Filter size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No se encontraron indicadores</p>
                    <p className="text-sm text-slate-400 mt-1">Prueba a ajustar los filtros o el término de búsqueda</p>
                </div>
            )}
        </div>
    );
}

export default IndicatorsTable;
