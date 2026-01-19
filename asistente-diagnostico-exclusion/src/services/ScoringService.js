
export const ScoringService = {
    // EIE Scale: 0-4
    LEVELS: {
        0: { label: 'Sin problemas', color: '#10b981', description: 'Acceso adecuado, pleno funcionamiento.' },
        1: { label: 'Leve', color: '#84cc16', description: 'Problemas menores, acceso parcial pero funcional.' },
        2: { label: 'Moderada', color: '#f59e0b', description: 'Problemas significativos, acceso limitado.' },
        3: { label: 'Severa', color: '#f97316', description: 'Problemas muy graves, acceso muy limitado o nulo.' },
        4: { label: 'Crítica', color: '#ef4444', description: 'Situación límite, riesgo inmediato, emergencia social.' }
    },

    // Default weights for each dimension (can be overridden by tool configuration)
    DEFAULT_WEIGHTS: {
        dim1: 1.0, // Económica
        dim2: 1.0, // Vivienda
        dim3: 1.0, // Salud Física
        dim4: 1.0, // Salud Mental
        dim5: 1.0, // Educación
        dim6: 1.0, // Relaciones
        dim7: 1.0, // Participación
        dim8: 1.0  // Legal
    },

    // ISES Ranges
    ISES_RANGES: [
        { max: 0.5, label: 'Integración Plena', color: '#10b981' },
        { max: 1.5, label: 'Vulnerabilidad Leve', color: '#84cc16' },
        { max: 2.5, label: 'Exclusión Moderada', color: '#f59e0b' },
        { max: 3.5, label: 'Exclusión Severa', color: '#f97316' },
        { max: 4.0, label: 'Exclusión Crítica', color: '#ef4444' }
    ],

    // Calculate ISES with optional custom weights
    calculateISES: (answers, dimensions, weights = null) => {
        const useWeights = weights || ScoringService.DEFAULT_WEIGHTS;
        let totalWeightedScore = 0;
        let totalWeight = 0;

        Object.keys(dimensions).forEach(dimId => {
            const dimAnswers = answers[dimId] || {};
            const score = parseFloat(dimAnswers.valuation || 0);
            const weight = useWeights[dimId] || 1.0;

            totalWeightedScore += score * weight;
            totalWeight += weight;
        });

        if (totalWeight === 0) return 0;

        return (totalWeightedScore / totalWeight).toFixed(2);
    },

    getISESLevel: (score) => {
        const numScore = parseFloat(score);
        for (const range of ScoringService.ISES_RANGES) {
            if (numScore <= range.max) {
                return range;
            }
        }
        return ScoringService.ISES_RANGES[ScoringService.ISES_RANGES.length - 1]; // Fallback to Critical
    },

    // Get self-perception scores per dimension (from selfPerception field)
    getSelfPerceptionScores: (answers, dimensions) => {
        const scores = {};
        Object.keys(dimensions).forEach(dimId => {
            const dimAnswers = answers[dimId] || {};
            // selfPerception is stored as 1-5, convert to 0-4 scale (inverted: 5->0, 1->4)
            const selfPerception = dimAnswers.selfPerception;
            if (selfPerception !== undefined && selfPerception !== null) {
                // Convert 1-5 scale to 0-4 exclusion scale (higher perception = better = lower exclusion)
                scores[dimId] = 5 - selfPerception;
            } else {
                scores[dimId] = null;
            }
        });
        return scores;
    },

    // Calculate objective valuation based on indicators (from section IV of reference document)
    calculateObjectiveValuation: (answers, dimensions) => {
        const scores = {};

        Object.keys(dimensions).forEach(dimId => {
            const dim = dimensions[dimId];
            const dimAnswers = answers[dimId] || {};

            let totalIndicatorScore = 0;
            let indicatorCount = 0;
            let criticalRisksCount = 0;

            // Count active risks
            if (dimAnswers.risks) {
                criticalRisksCount = Object.values(dimAnswers.risks).filter(v => v === true).length;
            }

            // Analyze indicators responses
            dim.subdimensions?.forEach(sub => {
                sub.indicators?.forEach(ind => {
                    const answer = dimAnswers[ind.id];
                    if (answer !== undefined && answer !== null && answer !== '') {
                        let indicatorScore = 0;

                        if (ind.type === 'select' && ind.options) {
                            // For select: position in options array (first option = worst = 4, last = best = 0)
                            const optionIndex = ind.options.indexOf(answer);
                            if (optionIndex !== -1) {
                                const totalOptions = ind.options.length;
                                // Calculate score based on position (first = highest risk)
                                indicatorScore = ((totalOptions - 1 - optionIndex) / (totalOptions - 1)) * 4;
                            }
                        } else if (ind.type === 'boolean') {
                            // For boolean: typically 'yes' indicates a problem (depends on context)
                            // Default: 'yes' or true = higher risk
                            const isPositive = answer === 'yes' || answer === true || answer === 'Sí';
                            // Check if this is a "good" indicator by checking label keywords
                            const goodKeywords = ['acceso', 'disponible', 'capacidad', 'apoyo', 'inscripción'];
                            const isGoodIndicator = goodKeywords.some(kw => ind.label.toLowerCase().includes(kw));

                            if (isGoodIndicator) {
                                indicatorScore = isPositive ? 0 : 4; // Having access is good
                            } else {
                                indicatorScore = isPositive ? 4 : 0; // Having a problem is bad
                            }
                        } else if (ind.type === 'number') {
                            // For numbers, we can't easily score without context
                            // Use moderate score
                            indicatorScore = 2;
                        }

                        totalIndicatorScore += indicatorScore;
                        indicatorCount++;
                    }
                });
            });

            // Calculate base score from indicators
            let baseScore = indicatorCount > 0 ? totalIndicatorScore / indicatorCount : 0;

            // Add weight for critical risks (each risk adds 0.5 up to max of 2)
            const riskBonus = Math.min(criticalRisksCount * 0.5, 2);

            // Final score capped at 4
            scores[dimId] = Math.min(baseScore + riskBonus, 4);
        });

        return scores;
    },

    // Get chart data for radar charts
    getRadarChartData: (dimensions, valuationType, answers, weights = null) => {
        const data = [];

        Object.values(dimensions).forEach(dim => {
            let value = 0;

            if (valuationType === 'valuation') {
                // Technical valuation (from form)
                value = parseFloat(answers[dim.id]?.valuation || 0);
            } else if (valuationType === 'selfPerception') {
                // Self perception (converted to exclusion scale)
                const sp = answers[dim.id]?.selfPerception;
                value = sp !== undefined ? 5 - sp : 0;
            } else if (valuationType === 'objective') {
                // Objective calculation based on indicators
                const objScores = ScoringService.calculateObjectiveValuation({ [dim.id]: answers[dim.id] }, { [dim.id]: dim });
                value = objScores[dim.id] || 0;
            }

            data.push({
                subject: dim.title.split(' ')[0],
                fullTitle: dim.title,
                value: parseFloat(value.toFixed(2)),
                fullMark: 4
            });
        });

        return data;
    },

    // NEW: Risk Detection Logic (Riesgos Críticos Identificados)
    getDetectedAlerts: (answers) => {
        const alerts = [];
        const hasRisk = (dimId, riskId) => answers[dimId]?.risks?.[riskId] === true;

        // 1. Alerta de Emergencia Vital: Ideación Suicida + Aislamiento Social
        if (hasRisk('dim4', 'risk_d4_1') && hasRisk('dim6', 'risk_d6_1')) {
            alerts.push({
                id: 'vital_emergency',
                title: 'EMERGENCIA VITAL',
                severity: 'critical',
                description: 'Se ha detectado Ideación Suicida activa en contexto de Aislamiento Social completo. Alto riesgo para la vida.',
                action: 'Intervención y acompañamiento inmediato.'
            });
        }

        // 2. Alerta de Exclusión Severa: Desempleo Larga Duración + Sin hogar/Vivienda Precaria
        if (hasRisk('dim1', 'risk_d1_1') && (hasRisk('dim2', 'risk_d2_1') || hasRisk('dim2', 'risk_d2_2'))) {
            alerts.push({
                id: 'severe_exclusion',
                title: 'EXCLUSIÓN SEVERA',
                severity: 'high',
                description: 'Combinación de Desempleo de Larga Duración y situación de Vivienda Precaria o Sinhogarismo.',
                action: 'Prioridad en acceso a recursos residenciales y de empleo.'
            });
        }

        // 3. Alerta de Desprotección Infantil: Absentismo/Abandono + Desestructuración/Violencia
        if ((hasRisk('dim5', 'risk_d5_2') || hasRisk('dim5', 'risk_d5_3')) && (hasRisk('dim6', 'risk_d6_2') || hasRisk('dim6', 'risk_d6_6'))) {
            alerts.push({
                id: 'child_protection',
                title: 'RIESGO DE MENORES',
                severity: 'high',
                description: 'Indicadores de problemas educativos graves (absentismo/abandono) en contexto familiar de violencia o ruptura.',
                action: 'Notificación a servicios de protección de menores.'
            });
        }

        // 4. Alerta de Colapso Financiero: Endeudamiento + Gasto Vivienda excesivo
        if (hasRisk('dim1', 'risk_d1_5') && hasRisk('dim2', 'risk_d2_4')) {
            alerts.push({
                id: 'financial_collapse',
                title: 'COLAPSO FINANCIERO',
                severity: 'medium',
                description: 'Endeudamiento grave combinado con sobrecarga de costes de vivienda.',
                action: 'Asesoramiento económico y mediación de deuda.'
            });
        }

        return alerts;
    },

    // Count total risks identified
    countTotalRisks: (answers) => {
        let count = 0;
        Object.values(answers).forEach(dim => {
            if (dim.risks) {
                count += Object.values(dim.risks).filter(v => v === true).length;
            }
        });
        return count;
    }
};
