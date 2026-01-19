
export const ScoringService = {
    // EIE Scale: 0-4
    LEVELS: {
        0: { label: 'Sin problemas', color: '#10b981', description: 'Acceso adecuado, pleno funcionamiento.' },
        1: { label: 'Leve', color: '#84cc16', description: 'Problemas menores, acceso parcial pero funcional.' },
        2: { label: 'Moderada', color: '#f59e0b', description: 'Problemas significativos, acceso limitado.' },
        3: { label: 'Severa', color: '#f97316', description: 'Problemas muy graves, acceso muy limitado o nulo.' },
        4: { label: 'Crítica', color: '#ef4444', description: 'Situación límite, riesgo inmediato, emergencia social.' }
    },

    // ISES Ranges
    ISES_RANGES: [
        { max: 0.5, label: 'Integración Plena', color: '#10b981' },
        { max: 1.5, label: 'Vulnerabilidad Leve', color: '#84cc16' },
        { max: 2.5, label: 'Exclusión Moderada', color: '#f59e0b' },
        { max: 3.5, label: 'Exclusión Severa', color: '#f97316' },
        { max: 4.0, label: 'Exclusión Crítica', color: '#ef4444' }
    ],

    calculateISES: (answers, dimensions) => {
        let totalScore = 0;
        let count = 0;

        Object.keys(dimensions).forEach(dimId => {
            const dimAnswers = answers[dimId] || {};
            const score = parseFloat(dimAnswers.valuation || 0);

            totalScore += score;
            count++;
        });

        if (count === 0) return 0;

        return (totalScore / count).toFixed(2);
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

    // NEW: Risk Detection Logic
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
