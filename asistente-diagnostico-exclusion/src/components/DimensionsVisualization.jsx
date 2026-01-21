import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Treemap, ResponsiveContainer, Tooltip as RechartsTooltip, Cell
} from 'recharts';
import * as d3 from 'd3';
import {
    Radar as RadarIcon, Network, LayoutGrid, Flame, GitBranch,
    Info, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2,
    Wallet, Home, HeartPulse, Brain, GraduationCap, Users, Vote, Scale,
    X, Table as TableIcon, ArrowRight
} from 'lucide-react';
import { DIMENSIONS, getAllIndicators } from '../data/dimensions';
import { FilterPanel } from './visualization/FilterPanel';
import { IndicatorsTable, formatDependencyMessage } from './visualization/IndicatorsTable';

// Color palette for dimensions
const DIMENSION_COLORS = {
    dim1: { primary: '#00A8A8', secondary: '#9AD3DA', name: 'Situación Económica y Laboral' },
    dim2: { primary: '#FF6B6B', secondary: '#FFBABA', name: 'Vivienda y Hábitat' },
    dim3: { primary: '#4ECDC4', secondary: '#A8E6CE', name: 'Salud y Bienestar Físico' },
    dim4: { primary: '#9B59B6', secondary: '#D4A5E8', name: 'Salud Mental y Bienestar Psicológico' },
    dim5: { primary: '#F39C12', secondary: '#F7DC6F', name: 'Educación y Competencias' },
    dim6: { primary: '#3498DB', secondary: '#85C1E9', name: 'Relaciones Sociales, Familiares y Comunitarias' },
    dim7: { primary: '#E74C3C', secondary: '#F1948A', name: 'Participación Ciudadana' },
    dim8: { primary: '#1ABC9C', secondary: '#76D7C4', name: 'Situación Legal y Administrativa' },
};

const DIMENSION_SHORT_NAMES = {
    dim1: 'Económica',
    dim2: 'Vivienda',
    dim3: 'Salud Física',
    dim4: 'Salud Mental',
    dim5: 'Educación',
    dim6: 'Rel. Sociales',
    dim7: 'Participación',
    dim8: 'Legal',
};

const DIMENSION_ICONS = {
    dim1: Wallet,
    dim2: Home,
    dim3: HeartPulse,
    dim4: Brain,
    dim5: GraduationCap,
    dim6: Users,
    dim7: Vote,
    dim8: Scale,
};

// Tab buttons for the different visualizations
const VISUALIZATION_TABS = [
    { id: 'radar', label: 'Radar', icon: RadarIcon, description: 'Vista general de dimensiones' },
    { id: 'network', label: 'Red de Dependencias', icon: Network, description: 'Conexiones entre indicadores' },
    { id: 'treemap', label: 'Mapa Jerárquico', icon: LayoutGrid, description: 'Estructura por área' },
    { id: 'heatmap', label: 'Mapa de Calor', icon: Flame, description: 'Densidad de indicadores' },
    { id: 'sunburst', label: 'Sunburst', icon: GitBranch, description: 'Vista radial jerárquica' },
    { id: 'table', label: 'Tabla', icon: TableIcon, description: 'Tabla dinámica con todos los indicadores y codificación' },
];

// ==================== FULLSCREEN WRAPPER ====================
function FullscreenWrapper({ children, title }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);

    const toggleFullscreen = useCallback(() => {
        if (!isFullscreen) {
            if (containerRef.current?.requestFullscreen) {
                containerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, [isFullscreen]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative ${isFullscreen ? 'bg-white p-6 overflow-auto' : ''}`}
            style={isFullscreen ? { height: '100vh', width: '100vw' } : {}}
        >
            {/* Fullscreen toggle button */}
            <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 z-20 p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors border border-slate-200"
                title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
                {isFullscreen ? (
                    <Minimize2 size={18} className="text-slate-600" />
                ) : (
                    <Maximize2 size={18} className="text-slate-600" />
                )}
            </button>

            {isFullscreen && (
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                </div>
            )}

            {children}
        </div>
    );
}

// ==================== ZOOM CONTROLS ====================
function ZoomControls({ onZoomIn, onZoomOut, onReset, zoom }) {
    return (
        <div className="absolute top-4 right-16 z-10 flex gap-2">
            <div className="flex items-center gap-1 bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
                <button
                    onClick={onZoomOut}
                    className="p-2 hover:bg-slate-50 transition-colors border-r border-slate-200"
                    title="Alejar"
                >
                    <ZoomOut size={16} className="text-slate-600" />
                </button>
                <span className="px-2 text-xs font-mono text-slate-600 min-w-[50px] text-center">
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={onZoomIn}
                    className="p-2 hover:bg-slate-50 transition-colors border-l border-slate-200"
                    title="Acercar"
                >
                    <ZoomIn size={16} className="text-slate-600" />
                </button>
            </div>
            <button
                onClick={onReset}
                className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors border border-slate-200"
                title="Restablecer vista"
            >
                <RotateCcw size={16} className="text-slate-600" />
            </button>
        </div>
    );
}

// ==================== DETAIL PANEL ====================
function DetailPanel({ item, onClose }) {
    if (!item) return null;

    const allIndicators = useMemo(() => getAllIndicators(), []);
    const formattedDep = item.dependsOn ? formatDependencyMessage(item.dependsOn, allIndicators) : null;

    return (
        <div className="absolute top-4 left-4 z-20 bg-white rounded-xl shadow-2xl p-4 max-w-md border border-slate-200">
            <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1 rounded-lg hover:bg-slate-100"
            >
                <X size={14} className="text-slate-400" />
            </button>

            <div className="flex items-center gap-2 mb-3">
                <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ background: item.color || '#00A8A8' }}
                />
                <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    {item.type === 'dimension' ? 'Dimensión' :
                        item.type === 'subdimension' ? 'Subdimensión' : 'Indicador'}
                </span>
            </div>

            <h3 className="font-bold text-slate-900 text-base mb-2 leading-tight">
                {item.fullLabel || item.label || item.name}
            </h3>

            {item.description && (
                <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                    {item.description}
                </p>
            )}

            {formattedDep && (
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div className="flex items-start gap-2 mb-2">
                        <ArrowRight size={14} className="text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-orange-800 font-medium leading-snug">
                            {formattedDep.summary}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                        <div className="bg-white/70 rounded p-1.5">
                            <span className="text-orange-600 font-semibold">Indicador origen:</span>
                            <p className="text-orange-800 font-mono text-xs mt-0.5">{formattedDep.sourceId}</p>
                        </div>
                        <div className="bg-white/70 rounded p-1.5">
                            <span className="text-orange-600 font-semibold">Valor requerido:</span>
                            <p className="text-orange-800 mt-0.5">{formattedDep.value}</p>
                        </div>
                    </div>
                </div>
            )}

            {item.indicatorCount !== undefined && (
                <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-3">
                    <span>📊 {item.indicatorCount} indicadores</span>
                    {item.riskCount !== undefined && (
                        <span className="text-orange-600">⚠️ {item.riskCount} riesgos</span>
                    )}
                    {item.potentialityCount !== undefined && (
                        <span className="text-emerald-600">✨ {item.potentialityCount} potencialidades</span>
                    )}
                </div>
            )}

            {item.indicatorType && (
                <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Tipo:</span>
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                        {item.indicatorType}
                    </span>
                    {item.hasDependency && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                            ⚡ Con dependencia
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

// ==================== RADAR CHART ====================
function RadarVisualization() {
    const [zoom, setZoom] = useState(1);
    const [selectedDim, setSelectedDim] = useState(null);
    // Filters to toggle each radar layer
    const [visibleLayers, setVisibleLayers] = useState({
        indicadores: true,
        subdimensiones: true,
        riesgos: true,
        potencialidades: true,
    });

    const toggleLayer = (layer) => {
        setVisibleLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
    };

    // Layer configuration with colors
    const layerConfig = [
        { key: 'indicadores', label: 'Indicadores', color: '#00A8A8' },
        { key: 'subdimensiones', label: 'Subdimensiones', color: '#FF6B6B' },
        { key: 'riesgos', label: 'Riesgos', color: '#F39C12' },
        { key: 'potencialidades', label: 'Potencialidades', color: '#10B981' },
    ];

    const data = useMemo(() => {
        return Object.entries(DIMENSIONS).map(([id, dim]) => {
            const indicatorCount = dim.subdimensions.reduce((acc, sub) => acc + sub.indicators.length, 0);
            const subdimensionCount = dim.subdimensions.length;
            const riskCount = dim.risks?.length || 0;
            const potentialityCount = dim.potentialities?.length || 0;

            return {
                dimension: DIMENSION_COLORS[id]?.name || dim.title,
                shortName: DIMENSION_SHORT_NAMES[id],
                dimId: id,
                indicadores: indicatorCount,
                subdimensiones: subdimensionCount * 10,
                riesgos: riskCount * 5,
                potencialidades: potentialityCount * 5,
                fullMark: 100,
                // Extra info for detail panel
                fullData: {
                    name: dim.title,
                    description: dim.description,
                    indicatorCount,
                    subdimensionCount,
                    riskCount,
                    potentialityCount,
                }
            };
        });
    }, []);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
    const handleReset = () => setZoom(1);

    return (
        <FullscreenWrapper title="Gráfico Radar - Dimensiones">
            <ZoomControls zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleReset} />

            {selectedDim && (
                <DetailPanel
                    item={{
                        type: 'dimension',
                        color: DIMENSION_COLORS[selectedDim.dimId]?.primary,
                        label: selectedDim.dimension,
                        fullLabel: selectedDim.dimension,
                        description: selectedDim.fullData.description,
                        indicatorCount: selectedDim.fullData.indicatorCount,
                        riskCount: selectedDim.fullData.riskCount,
                        potentialityCount: selectedDim.fullData.potentialityCount,
                    }}
                    onClose={() => setSelectedDim(null)}
                />
            )}

            {/* Layer Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-4 px-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2 self-center">
                    Mostrar:
                </span>
                {layerConfig.map(layer => (
                    <button
                        key={layer.key}
                        onClick={() => toggleLayer(layer.key)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${visibleLayers[layer.key]
                            ? 'bg-white shadow-md border-2'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                        style={{
                            borderColor: visibleLayers[layer.key] ? layer.color : undefined,
                            color: visibleLayers[layer.key] ? layer.color : undefined,
                        }}
                    >
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                                background: visibleLayers[layer.key] ? layer.color : '#cbd5e1',
                            }}
                        />
                        {layer.label}
                    </button>
                ))}
            </div>

            <div
                className="w-full transition-transform origin-center"
                style={{
                    height: `${500 * zoom}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center'
                }}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                            dataKey="dimension"
                            tick={({ x, y, payload, index }) => {
                                const dimData = data[index];
                                return (
                                    <g
                                        transform={`translate(${x},${y})`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedDim(dimData)}
                                    >
                                        <text
                                            textAnchor="middle"
                                            fill="#334155"
                                            fontSize={10}
                                            fontWeight={600}
                                            dy={0}
                                        >
                                            {payload.value.split(' ').slice(0, 2).join(' ')}
                                        </text>
                                        {payload.value.split(' ').length > 2 && (
                                            <text
                                                textAnchor="middle"
                                                fill="#64748b"
                                                fontSize={9}
                                                dy={12}
                                            >
                                                {payload.value.split(' ').slice(2, 4).join(' ')}
                                            </text>
                                        )}
                                    </g>
                                );
                            }}
                            tickLine={false}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            axisLine={false}
                        />
                        {visibleLayers.indicadores && (
                            <Radar
                                name="Indicadores"
                                dataKey="indicadores"
                                stroke="#00A8A8"
                                fill="#00A8A8"
                                fillOpacity={0.3}
                                strokeWidth={2}
                            />
                        )}
                        {visibleLayers.subdimensiones && (
                            <Radar
                                name="Subdimensiones"
                                dataKey="subdimensiones"
                                stroke="#FF6B6B"
                                fill="#FF6B6B"
                                fillOpacity={0.2}
                                strokeWidth={2}
                            />
                        )}
                        {visibleLayers.riesgos && (
                            <Radar
                                name="Riesgos"
                                dataKey="riesgos"
                                stroke="#F39C12"
                                fill="#F39C12"
                                fillOpacity={0.15}
                                strokeWidth={2}
                            />
                        )}
                        {visibleLayers.potencialidades && (
                            <Radar
                                name="Potencialidades"
                                dataKey="potencialidades"
                                stroke="#10B981"
                                fill="#10B981"
                                fillOpacity={0.2}
                                strokeWidth={2}
                            />
                        )}
                        <RechartsTooltip
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                const dimData = data.find(d => d.dimension === label);
                                if (!dimData?.fullData) return null;

                                const { indicatorCount, subdimensionCount, riskCount, potentialityCount, description } = dimData.fullData;

                                // Map of real values to display
                                const realValues = {
                                    'Indicadores': indicatorCount,
                                    'Subdimensiones': subdimensionCount,
                                    'Riesgos': riskCount,
                                    'Potencialidades': potentialityCount,
                                };

                                return (
                                    <div className="bg-white/98 rounded-xl shadow-xl p-4 max-w-xs border border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-2">{label}</h4>
                                        {description && (
                                            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                                                {description}
                                            </p>
                                        )}
                                        <div className="space-y-1">
                                            {payload.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <span style={{ color: item.color }} className="font-medium">
                                                        {item.name}:
                                                    </span>
                                                    <span className="text-slate-700 font-semibold">
                                                        {realValues[item.name] ?? item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend - Only show active layers */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 px-4">
                {layerConfig.filter(layer => visibleLayers[layer.key]).map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                        <span className="text-sm font-medium text-slate-600">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Dimension List */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 px-4">
                {data.map(dim => {
                    const Icon = DIMENSION_ICONS[dim.dimId] || Wallet;
                    return (
                        <button
                            key={dim.dimId}
                            onClick={() => setSelectedDim(dim)}
                            className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                            <Icon size={16} style={{ color: DIMENSION_COLORS[dim.dimId]?.primary }} />
                            <span className="text-xs font-medium text-slate-700 line-clamp-2">
                                {dim.dimension}
                            </span>
                        </button>
                    );
                })}
            </div>
        </FullscreenWrapper>
    );
}

// ==================== NETWORK GRAPH ====================
function NetworkVisualization({ filters = {} }) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [zoom, setZoom] = useState(1);
    const simulationRef = useRef(null);
    const zoomBehaviorRef = useRef(null);

    const { nodes, links } = useMemo(() => {
        const nodesList = [];
        const linksList = [];
        const { selectedDimension, selectedSubdimension, showDependencies } = filters;

        // Filter dimensions based on selection
        const dimensionsToShow = selectedDimension
            ? { [selectedDimension]: DIMENSIONS[selectedDimension] }
            : DIMENSIONS;

        // Add dimension nodes
        Object.entries(dimensionsToShow).forEach(([dimId, dim]) => {
            if (!dim) return;

            const dimNode = {
                id: dimId,
                type: 'dimension',
                label: DIMENSION_SHORT_NAMES[dimId],
                fullLabel: dim.title,
                description: dim.description,
                color: DIMENSION_COLORS[dimId]?.primary || '#00A8A8',
                radius: 30,
            };
            nodesList.push(dimNode);

            // Filter subdimensions
            const subsToShow = selectedSubdimension
                ? dim.subdimensions.filter(s => s.id === selectedSubdimension)
                : dim.subdimensions;

            // Add subdimension nodes
            subsToShow.forEach(sub => {
                const subNode = {
                    id: sub.id,
                    type: 'subdimension',
                    label: sub.title.split(' ').slice(0, 3).join(' '),
                    fullLabel: sub.title,
                    description: sub.description,
                    color: DIMENSION_COLORS[dimId]?.secondary || '#9AD3DA',
                    parentDim: dimId,
                    radius: 18,
                    indicatorCount: sub.indicators.length,
                };
                nodesList.push(subNode);
                linksList.push({ source: dimId, target: sub.id, type: 'hierarchy' });

                // Filter indicators by dependencies if needed
                const indicatorsToShow = showDependencies
                    ? sub.indicators.filter(i => i.dependsOn)
                    : sub.indicators;

                // Add indicator nodes with dependencies
                indicatorsToShow.forEach(ind => {
                    const indNode = {
                        id: ind.id,
                        type: 'indicator',
                        label: ind.label?.split(' ').slice(0, 4).join(' ') || ind.id,
                        fullLabel: ind.label || ind.id,
                        description: ind.description,
                        color: '#94a3b8',
                        parentSub: sub.id,
                        parentDim: dimId,
                        dependsOn: ind.dependsOn,
                        radius: 8,
                        indicatorType: ind.type,
                    };
                    nodesList.push(indNode);
                    linksList.push({ source: sub.id, target: ind.id, type: 'hierarchy' });

                    // Add dependency links
                    if (ind.dependsOn?.indicatorId) {
                        linksList.push({
                            source: ind.dependsOn.indicatorId,
                            target: ind.id,
                            type: 'dependency',
                            condition: ind.dependsOn.condition,
                        });
                    }
                });
            });
        });

        return { nodes: nodesList, links: linksList };
    }, [filters]);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = 700;

        // Clear previous
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [-width / 2, -height / 2, width, height]);

        // Create zoom behavior
        const zoomBehavior = d3.zoom()
            .scaleExtent([0.1, 5])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
                setZoom(event.transform.k);
            });

        zoomBehaviorRef.current = zoomBehavior;
        svg.call(zoomBehavior);

        const g = svg.append('g');

        // Create arrows for dependency links
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 20)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .append('path')
            .attr('d', 'M 0,-5 L 10,0 L 0,5')
            .attr('fill', '#FF6B6B');

        // Create simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
                if (d.type === 'dependency') return 200;
                if (d.source.type === 'dimension') return 120;
                if (d.source.type === 'subdimension') return 60;
                return 40;
            }))
            .force('charge', d3.forceManyBody().strength(d => {
                if (d.type === 'dimension') return -600;
                if (d.type === 'subdimension') return -300;
                return -80;
            }))
            .force('center', d3.forceCenter(0, 0))
            .force('collision', d3.forceCollide().radius(d => d.radius + 8));

        simulationRef.current = simulation;

        // Draw links
        const link = g.append('g')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke', d => d.type === 'dependency' ? '#FF6B6B' : '#cbd5e1')
            .attr('stroke-width', d => d.type === 'dependency' ? 2.5 : 1.5)
            .attr('stroke-dasharray', d => d.type === 'dependency' ? '8,4' : 'none')
            .attr('opacity', d => d.type === 'dependency' ? 0.9 : 0.4)
            .attr('marker-end', d => d.type === 'dependency' ? 'url(#arrowhead)' : null);

        // Draw nodes
        const node = g.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .attr('cursor', 'pointer')
            .call(d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }));

        // Node circles
        node.append('circle')
            .attr('r', d => d.radius)
            .attr('fill', d => d.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', d => d.type === 'dimension' ? 4 : d.type === 'subdimension' ? 3 : 2)
            .attr('filter', d => d.type === 'dimension' ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');

        // Labels for dimension and subdimension nodes
        node.filter(d => d.type !== 'indicator')
            .append('text')
            .text(d => d.fullLabel)
            .attr('text-anchor', 'middle')
            .attr('dy', d => d.type === 'dimension' ? 50 : 32)
            .attr('font-size', d => d.type === 'dimension' ? 12 : 10)
            .attr('font-weight', d => d.type === 'dimension' ? 700 : 600)
            .attr('fill', '#334155')
            .each(function (d) {
                const text = d3.select(this);
                const words = d.fullLabel.split(' ');
                if (words.length > 3) {
                    text.text('');
                    text.append('tspan')
                        .attr('x', 0)
                        .attr('dy', 0)
                        .text(words.slice(0, 3).join(' '));
                    text.append('tspan')
                        .attr('x', 0)
                        .attr('dy', '1.1em')
                        .text(words.slice(3).join(' '));
                }
            });

        // Hover effects
        node.on('mouseenter', function (event, d) {
            setSelectedNode(d);
            d3.select(this).select('circle')
                .transition()
                .duration(200)
                .attr('r', d.radius * 1.4)
                .attr('stroke-width', d.type === 'dimension' ? 5 : d.type === 'subdimension' ? 4 : 3);

            // Highlight connected links
            link.transition().duration(200)
                .attr('opacity', l =>
                    (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.15
                )
                .attr('stroke-width', l =>
                    (l.source.id === d.id || l.target.id === d.id)
                        ? (l.type === 'dependency' ? 4 : 3)
                        : (l.type === 'dependency' ? 2.5 : 1.5)
                );
        }).on('mouseleave', function (event, d) {
            d3.select(this).select('circle')
                .transition()
                .duration(200)
                .attr('r', d.radius)
                .attr('stroke-width', d.type === 'dimension' ? 4 : d.type === 'subdimension' ? 3 : 2);

            link.transition().duration(200)
                .attr('opacity', l => l.type === 'dependency' ? 0.9 : 0.4)
                .attr('stroke-width', l => l.type === 'dependency' ? 2.5 : 1.5);
        }).on('click', function (event, d) {
            setSelectedNode(d);
        });

        // Update positions on tick
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        return () => simulation.stop();
    }, [nodes, links]);

    const handleZoomIn = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.4);
    };

    const handleZoomOut = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
    };

    const handleReset = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().duration(500).call(
            zoomBehaviorRef.current.transform,
            d3.zoomIdentity
        );
    };

    return (
        <FullscreenWrapper title="Red de Dependencias">
            <div className="relative" ref={containerRef}>
                <ZoomControls zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleReset} />

                {selectedNode && (
                    <DetailPanel
                        item={selectedNode}
                        onClose={() => setSelectedNode(null)}
                    />
                )}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur rounded-xl shadow-lg p-4 border border-slate-200">
                    <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Leyenda</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-teal-500 border-2 border-white shadow" />
                            <span className="text-sm text-slate-600">Dimensiones (8)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-teal-200 border-2 border-white shadow" />
                            <span className="text-sm text-slate-600">Subdimensiones</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-white shadow" />
                            <span className="text-sm text-slate-600">Indicadores</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-0 border-t-2 border-dashed border-red-400" />
                                <span className="text-sm text-slate-600">Dependencias</span>
                            </div>
                        </div>
                    </div>
                </div>

                <svg ref={svgRef} className="w-full" style={{ height: '700px' }} />
            </div>
        </FullscreenWrapper>
    );
}

// ==================== TREEMAP ====================
function TreemapVisualization({ filters = {} }) {
    const [zoom, setZoom] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);

    const data = useMemo(() => {
        const { selectedDimension, selectedSubdimension, showDependencies } = filters;

        // Filter dimensions
        const dimensionsToShow = selectedDimension
            ? { [selectedDimension]: DIMENSIONS[selectedDimension] }
            : DIMENSIONS;

        return {
            name: 'Diagnóstico',
            children: Object.entries(dimensionsToShow)
                .filter(([_, dim]) => dim)
                .map(([dimId, dim]) => {
                    // Filter subdimensions
                    const subsToShow = selectedSubdimension
                        ? dim.subdimensions.filter(s => s.id === selectedSubdimension)
                        : dim.subdimensions;

                    return {
                        name: dim.title,
                        shortName: DIMENSION_SHORT_NAMES[dimId],
                        description: dim.description,
                        color: DIMENSION_COLORS[dimId]?.primary || '#00A8A8',
                        dimId,
                        children: subsToShow.map(sub => {
                            const indicatorsToUse = showDependencies
                                ? sub.indicators.filter(i => i.dependsOn)
                                : sub.indicators;

                            // If a specific subdimension is selected, show indicators as children
                            if (selectedSubdimension) {
                                return {
                                    name: sub.title,
                                    shortName: sub.title.split(' ').slice(0, 2).join(' '),
                                    description: sub.description,
                                    color: DIMENSION_COLORS[dimId]?.secondary || '#9AD3DA',
                                    parentColor: DIMENSION_COLORS[dimId]?.primary || '#00A8A8',
                                    indicatorCount: indicatorsToUse.length,
                                    dependentCount: sub.indicators.filter(i => i.dependsOn).length,
                                    dimId,
                                    children: indicatorsToUse.map(ind => ({
                                        name: ind.label || ind.id,
                                        shortName: ind.label?.split(' ').slice(0, 3).join(' ') || ind.id,
                                        description: ind.description,
                                        value: 1,
                                        color: ind.dependsOn ? '#FED7AA' : '#cbd5e1',
                                        parentColor: DIMENSION_COLORS[dimId]?.secondary || '#9AD3DA',
                                        indicatorType: ind.type,
                                        hasDependency: !!ind.dependsOn,
                                        dimId,
                                        isIndicator: true,
                                    }))
                                };
                            }

                            // Normal view: show subdimensions with indicator count
                            return {
                                name: sub.title,
                                shortName: sub.title.split(' ').slice(0, 2).join(' '),
                                description: sub.description,
                                value: Math.max(indicatorsToUse.length, 1),
                                color: DIMENSION_COLORS[dimId]?.secondary || '#9AD3DA',
                                parentColor: DIMENSION_COLORS[dimId]?.primary || '#00A8A8',
                                indicatorCount: indicatorsToUse.length,
                                dependentCount: sub.indicators.filter(i => i.dependsOn).length,
                                dimId,
                            };
                        }),
                    };
                }),
        };
    }, [filters]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
    const handleReset = () => setZoom(1);

    const CustomTreemapContent = (props) => {
        const { x, y, width, height, name, shortName, color, parentColor, indicatorCount, depth, description, dependentCount, isIndicator, indicatorType, hasDependency } = props;

        if (width < 20 || height < 20) return null;

        const displayName = width > 120 ? name : (shortName || name?.split(' ').slice(0, 2).join(' '));

        // Determine what type this is based on depth and isIndicator flag
        const getType = () => {
            if (isIndicator || depth === 3) return 'indicator';
            if (depth === 1) return 'dimension';
            return 'subdimension';
        };

        const itemType = getType();
        const bgColor = itemType === 'indicator' ? color : (depth === 1 ? color : parentColor);

        return (
            <g
                onClick={() => setSelectedItem({
                    type: itemType,
                    label: name,
                    fullLabel: name,
                    description,
                    color: bgColor,
                    indicatorCount,
                    dependentCount,
                    indicatorType,
                    hasDependency,
                })}
                style={{ cursor: 'pointer' }}
            >
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={bgColor}
                    stroke="#fff"
                    strokeWidth={depth === 1 ? 3 : (itemType === 'indicator' ? 1 : 2)}
                    rx={itemType === 'indicator' ? 4 : 6}
                    style={{
                        filter: 'brightness(1)',
                        transition: 'filter 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.filter = 'brightness(1.1)'}
                    onMouseLeave={(e) => e.target.style.filter = 'brightness(1)'}
                />
                {width > 50 && height > 35 && (
                    <>
                        <text
                            x={x + width / 2}
                            y={y + (height > 60 ? height / 2 - 8 : height / 2)}
                            textAnchor="middle"
                            fill={itemType === 'indicator' ? '#334155' : '#fff'}
                            fontSize={depth === 1 ? 13 : (itemType === 'indicator' ? 10 : 11)}
                            fontWeight={700}
                            style={{ textShadow: itemType === 'indicator' ? 'none' : '0 1px 3px rgba(0,0,0,0.4)', pointerEvents: 'none' }}
                        >
                            {displayName?.length > 20 ? displayName.slice(0, 18) + '...' : displayName}
                        </text>
                        {indicatorCount && height > 55 && !isIndicator && (
                            <text
                                x={x + width / 2}
                                y={y + height / 2 + 14}
                                textAnchor="middle"
                                fill="rgba(255,255,255,0.85)"
                                fontSize={10}
                                fontWeight={500}
                                style={{ pointerEvents: 'none' }}
                            >
                                {indicatorCount} indicadores
                            </text>
                        )}
                        {hasDependency && height > 40 && (
                            <text
                                x={x + width / 2}
                                y={y + height / 2 + (height > 60 ? 12 : 8)}
                                textAnchor="middle"
                                fill="#ea580c"
                                fontSize={10}
                                style={{ pointerEvents: 'none' }}
                            >
                                ⚡ dependencia
                            </text>
                        )}
                    </>
                )}
            </g>
        );
    };

    return (
        <FullscreenWrapper title="Mapa Jerárquico (Treemap)">
            <ZoomControls zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleReset} />

            {selectedItem && (
                <DetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}

            <div
                className="w-full transition-transform"
                style={{
                    height: `${550 * zoom}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center'
                }}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={data.children}
                        dataKey="value"
                        aspectRatio={16 / 9}
                        stroke="#fff"
                        content={<CustomTreemapContent />}
                    />
                </ResponsiveContainer>
            </div>
        </FullscreenWrapper>
    );
}

// ==================== HEATMAP ====================
function HeatmapVisualization({ filters = {} }) {
    const [zoom, setZoom] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);

    const data = useMemo(() => {
        const { selectedDimension, selectedSubdimension, showDependencies } = filters;

        // Filter dimensions
        const dimensionsToShow = selectedDimension
            ? { [selectedDimension]: DIMENSIONS[selectedDimension] }
            : DIMENSIONS;

        return Object.entries(dimensionsToShow)
            .filter(([_, dim]) => dim)
            .map(([dimId, dim]) => {
                // Filter subdimensions
                const subsToShow = selectedSubdimension
                    ? dim.subdimensions.filter(s => s.id === selectedSubdimension)
                    : dim.subdimensions;

                return {
                    dimension: dim.title,
                    shortName: DIMENSION_SHORT_NAMES[dimId],
                    description: dim.description,
                    dimId,
                    subdimensions: subsToShow.map(sub => {
                        const indicatorsToUse = showDependencies
                            ? sub.indicators.filter(i => i.dependsOn)
                            : sub.indicators;
                        return {
                            id: sub.id,
                            name: sub.title,
                            shortName: sub.title.split(' ').slice(0, 2).join(' '),
                            description: sub.description,
                            total: indicatorsToUse.length,
                            dependent: sub.indicators.filter(i => i.dependsOn).length,
                            types: {
                                select: indicatorsToUse.filter(i => i.type === 'select').length,
                                radio: indicatorsToUse.filter(i => i.type === 'radio').length,
                                boolean: indicatorsToUse.filter(i => i.type === 'boolean').length,
                                number: indicatorsToUse.filter(i => i.type === 'number').length,
                                text: indicatorsToUse.filter(i => i.type === 'text').length,
                                scale: indicatorsToUse.filter(i => i.type === 'scale').length,
                                checkbox: indicatorsToUse.filter(i => i.type === 'checkbox').length,
                            },
                            // Include individual indicators when subdimension is selected
                            indicators: selectedSubdimension ? indicatorsToUse.map(ind => ({
                                id: ind.id,
                                label: ind.label || ind.id,
                                description: ind.description,
                                type: ind.type,
                                hasDependency: !!ind.dependsOn,
                            })) : []
                        };
                    })
                };
            });
    }, [filters]);

    // Check if we're showing details of a specific subdimension
    const showingIndicatorDetails = filters?.selectedSubdimension;

    const maxIndicators = useMemo(() => {
        let max = 0;
        data.forEach(dim => {
            dim.subdimensions.forEach(sub => {
                if (sub.total > max) max = sub.total;
            });
        });
        return max;
    }, [data]);

    const getHeatColor = (value, max) => {
        const intensity = value / max;
        if (intensity < 0.2) return { bg: '#DCFCE7', text: '#166534' };
        if (intensity < 0.4) return { bg: '#86EFAC', text: '#166534' };
        if (intensity < 0.6) return { bg: '#22C55E', text: '#fff' };
        if (intensity < 0.8) return { bg: '#16A34A', text: '#fff' };
        return { bg: '#15803D', text: '#fff' };
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 1.5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.6));
    const handleReset = () => setZoom(1);

    return (
        <FullscreenWrapper title="Mapa de Calor">
            <ZoomControls zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleReset} />

            {selectedItem && (
                <DetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}

            <div
                className="overflow-x-auto"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
                <div className="min-w-[900px] pr-16">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6 px-4">
                        <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                            Intensidad por subdimensión
                        </span>
                        <div className="flex items-center gap-1 ml-auto">
                            {[
                                { bg: '#DCFCE7', label: '1-3' },
                                { bg: '#86EFAC', label: '4-6' },
                                { bg: '#22C55E', label: '7-9' },
                                { bg: '#16A34A', label: '10-12' },
                                { bg: '#15803D', label: '13+' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-1">
                                    <div className="w-5 h-5 rounded" style={{ background: item.bg }} />
                                    <span className="text-xs text-slate-500">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="space-y-4">
                        {data.map(dim => {
                            const Icon = DIMENSION_ICONS[dim.dimId] || Wallet;
                            return (
                                <div key={dim.dimId}>
                                    <div className="flex items-stretch gap-3">
                                        {/* Dimension label */}
                                        <button
                                            onClick={() => setSelectedItem({
                                                type: 'dimension',
                                                label: dim.dimension,
                                                fullLabel: dim.dimension,
                                                description: dim.description,
                                                color: DIMENSION_COLORS[dim.dimId]?.primary,
                                            })}
                                            className="w-56 flex-shrink-0 flex items-start gap-3 px-4 py-3 rounded-xl hover:opacity-90 transition-opacity text-left"
                                            style={{ background: `${DIMENSION_COLORS[dim.dimId]?.primary}15` }}
                                        >
                                            <Icon size={18} className="flex-shrink-0 mt-0.5" style={{ color: DIMENSION_COLORS[dim.dimId]?.primary }} />
                                            <span className="text-sm font-bold text-slate-800 leading-tight">
                                                {dim.dimension}
                                            </span>
                                        </button>

                                        {/* Subdimension cells */}
                                        <div className="flex-1 flex gap-2 flex-wrap">
                                            {dim.subdimensions.map((sub, idx) => {
                                                const colors = getHeatColor(sub.total, maxIndicators);
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedItem({
                                                            type: 'subdimension',
                                                            label: sub.name,
                                                            fullLabel: sub.name,
                                                            description: sub.description,
                                                            color: DIMENSION_COLORS[dim.dimId]?.primary,
                                                            indicatorCount: sub.total,
                                                            dependentCount: sub.dependent,
                                                        })}
                                                        className="flex-1 min-w-[140px] max-w-[200px] p-3 rounded-xl transition-all hover:scale-105 cursor-pointer text-left"
                                                        style={{ background: colors.bg }}
                                                    >
                                                        <p className="text-xs font-bold mb-1 leading-tight" style={{ color: colors.text }}>
                                                            {sub.name}
                                                        </p>
                                                        <p className="text-2xl font-extrabold" style={{ color: colors.text }}>
                                                            {sub.total}
                                                        </p>
                                                        {sub.dependent > 0 && (
                                                            <p className="text-xs mt-1 opacity-80" style={{ color: colors.text }}>
                                                                {sub.dependent} con deps.
                                                            </p>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Show indicators list when subdimension is selected */}
                                    {showingIndicatorDetails && dim.subdimensions.map(sub => (
                                        sub.indicators && sub.indicators.length > 0 && (
                                            <div key={sub.id} className="mt-4 ml-60 bg-slate-50 rounded-xl p-4 border border-slate-200">
                                                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full" style={{ background: DIMENSION_COLORS[dim.dimId]?.primary }}></span>
                                                    Indicadores de "{sub.name}"
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {sub.indicators.map((ind, i) => (
                                                        <div
                                                            key={ind.id}
                                                            onClick={() => setSelectedItem({
                                                                type: 'indicator',
                                                                label: ind.label,
                                                                fullLabel: ind.label,
                                                                description: ind.description,
                                                                indicatorType: ind.type,
                                                                hasDependency: ind.hasDependency,
                                                                color: DIMENSION_COLORS[dim.dimId]?.primary,
                                                            })}
                                                            className="p-3 bg-white rounded-lg border border-slate-200 hover:border-teal-400 hover:shadow-sm transition-all cursor-pointer"
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                {ind.hasDependency && (
                                                                    <span className="text-orange-500 text-xs mt-0.5">⚡</span>
                                                                )}
                                                                <div className="flex-1">
                                                                    <p className="text-xs font-semibold text-slate-700 leading-tight">
                                                                        {ind.label}
                                                                    </p>
                                                                    {ind.description && (
                                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                                            {ind.description}
                                                                        </p>
                                                                    )}
                                                                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                                                                        {ind.type}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </FullscreenWrapper>
    );
}

// ==================== SUNBURST CHART (D3) ====================
function SunburstVisualization({ filters = {} }) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [selectedArc, setSelectedArc] = useState(null);
    const [zoom, setZoom] = useState(1);
    const zoomBehaviorRef = useRef(null);

    const hierarchyData = useMemo(() => {
        const { selectedDimension, selectedSubdimension, showDependencies } = filters;

        // Filter dimensions
        const dimensionsToShow = selectedDimension
            ? { [selectedDimension]: DIMENSIONS[selectedDimension] }
            : DIMENSIONS;

        return {
            name: 'Diagnóstico',
            children: Object.entries(dimensionsToShow)
                .filter(([_, dim]) => dim)
                .map(([dimId, dim]) => {
                    // Filter subdimensions
                    const subsToShow = selectedSubdimension
                        ? dim.subdimensions.filter(s => s.id === selectedSubdimension)
                        : dim.subdimensions;

                    return {
                        name: dim.title,
                        shortName: DIMENSION_SHORT_NAMES[dimId],
                        description: dim.description,
                        dimId,
                        color: DIMENSION_COLORS[dimId]?.primary || '#00A8A8',
                        children: subsToShow.map(sub => {
                            // Filter indicators by dependencies if needed
                            const indicatorsToShow = showDependencies
                                ? sub.indicators.filter(i => i.dependsOn)
                                : sub.indicators;

                            return {
                                name: sub.title,
                                shortName: sub.title.split(' ').slice(0, 2).join(' '),
                                description: sub.description,
                                color: DIMENSION_COLORS[dimId]?.secondary || '#9AD3DA',
                                parentColor: DIMENSION_COLORS[dimId]?.primary,
                                dimId,
                                indicatorCount: indicatorsToShow.length,
                                children: indicatorsToShow.map(ind => ({
                                    name: ind.label || ind.id,
                                    shortName: ind.label?.split(' ').slice(0, 3).join(' ') || ind.id,
                                    description: ind.description,
                                    value: 1,
                                    type: ind.type,
                                    hasDependency: !!ind.dependsOn,
                                    dependsOn: ind.dependsOn,
                                    parentColor: DIMENSION_COLORS[dimId]?.secondary,
                                    dimId,
                                }))
                            };
                        })
                    };
                })
        };
    }, [filters]);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = 600;
        const radius = Math.min(width, height) / 2 - 40;

        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // Zoom behavior
        const zoomBehavior = d3.zoom()
            .scaleExtent([0.5, 3])
            .on('zoom', (event) => {
                g.attr('transform', `translate(${width / 2 + event.transform.x},${height / 2 + event.transform.y}) scale(${event.transform.k})`);
                setZoom(event.transform.k);
            });

        zoomBehaviorRef.current = zoomBehavior;
        svg.call(zoomBehavior);

        const g = svg.append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        const root = d3.hierarchy(hierarchyData)
            .sum(d => d.value || 0)
            .sort((a, b) => b.value - a.value);

        const partition = d3.partition()
            .size([2 * Math.PI, radius]);

        partition(root);

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(0.008)
            .padRadius(radius / 2)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1 - 2);

        const getColor = (d) => {
            if (d.depth === 0) return '#f1f5f9';
            if (d.data.color) return d.data.color;
            if (d.data.parentColor) return d.data.parentColor;
            return '#00A8A8';
        };

        // Draw arcs
        g.selectAll('path')
            .data(root.descendants().filter(d => d.depth))
            .join('path')
            .attr('fill', d => getColor(d))
            .attr('fill-opacity', d => d.depth === 3 ? 0.75 : 1)
            .attr('d', arc)
            .attr('stroke', '#fff')
            .attr('stroke-width', d => d.depth === 1 ? 3 : 2)
            .style('cursor', 'pointer')
            .on('mouseenter', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr('fill-opacity', 1)
                    .attr('transform', () => {
                        const [x, y] = arc.centroid(d);
                        const angle = Math.atan2(y, x);
                        const dist = 6;
                        return `translate(${Math.cos(angle) * dist},${Math.sin(angle) * dist})`;
                    });

                setSelectedArc({
                    type: d.depth === 1 ? 'dimension' : d.depth === 2 ? 'subdimension' : 'indicator',
                    label: d.data.shortName || d.data.name,
                    fullLabel: d.data.name,
                    description: d.data.description,
                    color: getColor(d),
                    indicatorCount: d.data.indicatorCount,
                    indicatorType: d.data.type,
                    dependsOn: d.data.dependsOn,
                });
            })
            .on('mouseleave', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr('fill-opacity', d.depth === 3 ? 0.75 : 1)
                    .attr('transform', 'translate(0,0)');
            })
            .on('click', function (event, d) {
                setSelectedArc({
                    type: d.depth === 1 ? 'dimension' : d.depth === 2 ? 'subdimension' : 'indicator',
                    label: d.data.shortName || d.data.name,
                    fullLabel: d.data.name,
                    description: d.data.description,
                    color: getColor(d),
                    indicatorCount: d.data.indicatorCount,
                    indicatorType: d.data.type,
                    dependsOn: d.data.dependsOn,
                });
            });

        // Center text
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.5em')
            .attr('font-size', 16)
            .attr('font-weight', 800)
            .attr('fill', '#334155')
            .text('Estructura');

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1em')
            .attr('font-size', 12)
            .attr('fill', '#64748b')
            .text('del Diagnóstico');

    }, [hierarchyData]);

    const handleZoomIn = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.4);
    };

    const handleZoomOut = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
    };

    const handleReset = () => {
        const svg = d3.select(svgRef.current);
        const width = containerRef.current.clientWidth;
        const height = 600;
        svg.transition().duration(500).call(
            zoomBehaviorRef.current.transform,
            d3.zoomIdentity
        );
    };

    return (
        <FullscreenWrapper title="Sunburst - Vista Radial Jerárquica">
            <div className="relative" ref={containerRef}>
                <ZoomControls zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleReset} />

                {selectedArc && (
                    <DetailPanel item={selectedArc} onClose={() => setSelectedArc(null)} />
                )}

                {/* Legend */}
                <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur rounded-xl shadow-lg p-4 border border-slate-200">
                    <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Niveles</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-3 rounded bg-teal-500" />
                            <span className="text-sm text-slate-600">Dimensiones (8)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-3 rounded bg-teal-200" />
                            <span className="text-sm text-slate-600">Subdimensiones</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-3 rounded bg-slate-300" />
                            <span className="text-sm text-slate-600">Indicadores</span>
                        </div>
                    </div>
                </div>

                <svg ref={svgRef} className="w-full" style={{ height: '600px' }} />
            </div>
        </FullscreenWrapper>
    );
}

// ==================== STATISTICS CARD ====================
function StatisticsCard() {
    const stats = useMemo(() => {
        const allIndicators = getAllIndicators();
        const dependentIndicators = allIndicators.filter(i => i.dependsOn);

        const typeCount = {};
        allIndicators.forEach(ind => {
            typeCount[ind.type] = (typeCount[ind.type] || 0) + 1;
        });

        return {
            dimensions: Object.keys(DIMENSIONS).length,
            subdimensions: Object.values(DIMENSIONS).reduce((acc, dim) => acc + dim.subdimensions.length, 0),
            indicators: allIndicators.length,
            dependencies: dependentIndicators.length,
            risks: Object.values(DIMENSIONS).reduce((acc, dim) => acc + (dim.risks?.length || 0), 0),
            potentialities: Object.values(DIMENSIONS).reduce((acc, dim) => acc + (dim.potentialities?.length || 0), 0),
            types: typeCount,
        };
    }, []);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
                { label: 'Dimensiones', value: stats.dimensions, color: '#00A8A8' },
                { label: 'Subdimensiones', value: stats.subdimensions, color: '#FF6B6B' },
                { label: 'Indicadores', value: stats.indicators, color: '#4ECDC4' },
                { label: 'Dependencias', value: stats.dependencies, color: '#F39C12' },
                { label: 'Riesgos', value: stats.risks, color: '#E74C3C' },
                { label: 'Potencialidades', value: stats.potentialities, color: '#1ABC9C' },
            ].map(stat => (
                <div
                    key={stat.label}
                    className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        {stat.label}
                    </p>
                    <p className="text-3xl font-bold" style={{ color: stat.color }}>
                        {stat.value}
                    </p>
                </div>
            ))}
        </div>
    );
}

// ==================== MAIN COMPONENT ====================
export function DimensionsVisualization({ onBack }) {
    const [activeTab, setActiveTab] = useState('radar');
    const [filters, setFilters] = useState({
        selectedDimension: null,
        selectedSubdimension: null,
        showDependencies: false
    });

    const renderVisualization = () => {
        switch (activeTab) {
            case 'radar':
                return <RadarVisualization />;
            case 'network':
                return <NetworkVisualization filters={filters} />;
            case 'treemap':
                return <TreemapVisualization filters={filters} />;
            case 'heatmap':
                return <HeatmapVisualization filters={filters} />;
            case 'sunburst':
                return <SunburstVisualization filters={filters} />;
            case 'table':
                return <IndicatorsTable filters={filters} />;
            default:
                return <RadarVisualization />;
        }
    };

    const showFilters = activeTab !== 'radar';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                            Mapa de Indicadores
                        </h1>
                        <p className="text-slate-500">
                            Visualización interactiva de dimensiones, subdimensiones e indicadores
                        </p>
                    </div>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-medium"
                        >
                            ← Volver
                        </button>
                    )}
                </div>

                {/* Statistics */}
                <StatisticsCard />

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {VISUALIZATION_TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
                  ${isActive
                                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
                                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                    }
                `}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Description */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <Info size={16} />
                    <span>{VISUALIZATION_TABS.find(t => t.id === activeTab)?.description}</span>
                    <span className="text-slate-400 ml-2">• Haz clic en los elementos para ver detalles completos</span>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <FilterPanel filters={filters} onFiltersChange={setFilters} />
                )}
            </div>

            {/* Visualization Container */}
            <div className="max-w-7xl mx-auto">
                {activeTab === 'table' ? (
                    renderVisualization()
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 overflow-hidden">
                        {renderVisualization()}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DimensionsVisualization;
