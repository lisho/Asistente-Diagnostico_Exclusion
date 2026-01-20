/**
 * Estructura completa de las 8 Dimensiones Fundamentales de Análisis
 * Basado en: Marco Integral para el Diagnóstico Multidimensional de Situaciones de Exclusión Social
 * 
 * SISTEMA DE DEPENDENCIAS:
 * - dependsOn: { indicatorId: string, condition: 'equals' | 'notEquals' | 'includes', value: any }
 * - Si la condición no se cumple, el indicador se oculta en el formulario
 */

export const DIMENSIONS = {
    dim1: {
        id: 'dim1',
        title: 'Situación Económica y Laboral',
        description: 'Capacidad de la persona/familia para acceder a ingresos suficientes, mantener empleo estable y participar de manera digna en el mercado laboral.',
        subdimensions: [
            {
                id: 'sub1_1',
                title: 'Empleo y Actividad Laboral',
                description: 'Evalúe la situación actual de empleo, tipo de contratación y barreras de acceso al mercado laboral. Considere tanto la situación formal como la real.',
                indicators: [
                    {
                        id: 'ind1_1_1',
                        label: 'Situación laboral actual',
                        type: 'select',
                        options: ['Sin empleo (>12 meses)', 'Sin empleo (<12 meses)', 'Empleo precario', 'Empleo tiempo parcial no deseado', 'Empleo estable tiempo completo'],
                        description: 'Identifique la situación laboral principal de la persona. El empleo precario incluye trabajos sin contrato, temporales muy cortos o con condiciones abusivas.'
                    },
                    // Tipo de contrato solo si tiene empleo
                    {
                        id: 'ind1_1_2',
                        label: 'Tipo de contrato',
                        type: 'select',
                        options: ['Sin contrato', 'Informal', 'Temporal', 'Indefinido'],
                        description: 'Valore la protección legal del empleo. Sin contrato implica vulnerabilidad total; informal indica trabajo sumergido.',
                        dependsOn: { indicatorId: 'ind1_1_1', condition: 'includes', value: ['Empleo precario', 'Empleo tiempo parcial no deseado', 'Empleo estable tiempo completo'] }
                    },
                    // Jornada laboral solo si tiene empleo
                    {
                        id: 'ind1_1_3',
                        label: 'Jornada laboral',
                        type: 'select',
                        options: ['< 20 horas', '20-30 horas', '> 30 horas adecuada'],
                        description: 'Evalúe si la jornada permite ingresos suficientes y conciliación familiar.',
                        dependsOn: { indicatorId: 'ind1_1_1', condition: 'includes', value: ['Empleo precario', 'Empleo tiempo parcial no deseado', 'Empleo estable tiempo completo'] }
                    },
                    {
                        id: 'ind1_1_4',
                        label: 'Acceso a mercado laboral',
                        type: 'select',
                        options: ['Barrera alta', 'Barrera moderada', 'Sin barreras'],
                        description: 'Considere factores como idioma, discapacidad, edad, género, etnia, situación administrativa o estigma social que dificulten el acceso.'
                    },
                    {
                        id: 'ind1_1_5',
                        label: 'Experiencia laboral',
                        type: 'select',
                        options: ['Fragmentada', 'Limitada', 'Consolidada'],
                        description: 'Fragmentada: muchos trabajos cortos sin continuidad. Limitada: poca experiencia. Consolidada: trayectoria estable y demostrable.'
                    },
                    {
                        id: 'ind1_1_6',
                        label: 'Formación profesional',
                        type: 'select',
                        options: ['Inexistente', 'Desactualizada', 'Continua'],
                        description: 'Evalúe si posee cualificación profesional actual y demandada por el mercado laboral.'
                    },
                    // Tiempo en desempleo solo si está sin empleo
                    {
                        id: 'ind1_1_7',
                        label: 'Tiempo en desempleo (meses)',
                        type: 'number',
                        description: 'Tiempo transcurrido desde el último empleo. Más de 12 meses se considera desempleo de larga duración.',
                        dependsOn: { indicatorId: 'ind1_1_1', condition: 'includes', value: ['Sin empleo (>12 meses)', 'Sin empleo (<12 meses)'] }
                    },
                    // Búsqueda activa de empleo solo si está sin empleo
                    {
                        id: 'ind1_1_8',
                        label: 'Búsqueda activa de empleo',
                        type: 'boolean',
                        description: '¿Realiza acciones concretas de búsqueda: envío de CV, inscripción en ofertas, asistencia a entrevistas?',
                        dependsOn: { indicatorId: 'ind1_1_1', condition: 'includes', value: ['Sin empleo (>12 meses)', 'Sin empleo (<12 meses)'] }
                    }
                ]
            },
            {
                id: 'sub1_2',
                title: 'Estabilidad e Ingresos Económicos',
                description: 'Analice la capacidad económica real: ingresos, estabilidad, acceso a prestaciones y nivel de endeudamiento. Compare con umbrales de pobreza locales.',
                indicators: [
                    {
                        id: 'ind1_2_1',
                        label: 'Ingresos netos mensuales (€)',
                        type: 'number',
                        description: 'Total de ingresos netos mensuales del hogar. Compare con SMI (1.134€/2024) y umbral de pobreza (60% mediana ~9.535€/año).'
                    },
                    {
                        id: 'ind1_2_2',
                        label: 'Precarización de ingresos',
                        type: 'select',
                        options: ['Variación > 30%', 'Variación moderada', 'Estable'],
                        description: 'Evalúe la variabilidad de ingresos mes a mes. Ingresos inestables dificultan planificación y generan estrés crónico.'
                    },
                    {
                        id: 'ind1_2_3',
                        label: 'Acceso a prestaciones',
                        type: 'select',
                        options: ['Sin cobertura', 'Cobertura parcial', 'Cobertura completa'],
                        description: 'Prestaciones incluyen: desempleo, subsidios, IMV/RMI, pensiones, ayudas familiares, etc.'
                    },
                    // Tipo de prestación solo si tiene alguna cobertura
                    {
                        id: 'ind1_2_3b', label: 'Tipo de prestación principal', type: 'select', options: ['Desempleo', 'Subsidio', 'RMI/IMV', 'Pensión', 'Otra'],
                        dependsOn: { indicatorId: 'ind1_2_3', condition: 'notEquals', value: 'Sin cobertura' }
                    },
                    {
                        id: 'ind1_2_4',
                        label: 'Nivel de deuda',
                        type: 'select',
                        options: ['> 36 meses ingresos', '6-36 meses', '< 6 meses', 'Sin deuda'],
                        description: 'Deuda superior a 36 meses de ingresos indica sobreendeudamiento crítico. Incluya todas las deudas: hipoteca, préstamos, servicios.'
                    },
                    // Tipo de deuda solo si tiene deuda
                    {
                        id: 'ind1_2_4b', label: 'Tipos de deuda', type: 'select', options: ['Hipoteca', 'Préstamos personales', 'Deudas consumo', 'Deudas servicios', 'Mixta'],
                        dependsOn: { indicatorId: 'ind1_2_4', condition: 'notEquals', value: 'Sin deuda' }
                    },
                    {
                        id: 'ind1_2_5',
                        label: 'Capacidad de ahorro',
                        type: 'boolean',
                        description: '¿Puede reservar aunque sea una pequeña cantidad mensual? La ausencia total indica vulnerabilidad ante imprevistos.'
                    },
                    {
                        id: 'ind1_2_6',
                        label: 'Capacidad gastos imprevistos',
                        type: 'select',
                        options: ['Nula', 'Limitada', 'Total'],
                        description: '¿Podría afrontar un gasto inesperado de 600€ (ej: reparación, multa, tratamiento)? Indicador clave de resiliencia económica.'
                    }
                ]
            },
            {
                id: 'sub1_3',
                title: 'Condiciones Laborales',
                description: 'Evalúe la calidad del empleo: jornada, seguridad, protección social y conciliación. Solo aplica si la persona tiene empleo activo.',
                indicators: [
                    {
                        id: 'ind1_3_1',
                        label: 'Jornada respecto a deseada',
                        type: 'select',
                        options: ['Excesiva', 'Insuficiente', 'Adecuada'],
                        description: 'Excesiva: más horas de las deseadas (sin compensación). Insuficiente: menos horas, afectando ingresos.',
                        dependsOn: { indicatorId: 'ind1_1_1', condition: 'includes', value: ['Empleo precario', 'Empleo tiempo parcial no deseado', 'Empleo estable tiempo completo'] }
                    },
                    {
                        id: 'ind1_3_2',
                        label: 'Seguridad e higiene laboral',
                        type: 'boolean',
                        description: '¿El lugar de trabajo cumple normativa de prevención de riesgos? Considere EPIs, formación, medidas de seguridad.',
                        dependsOn: { indicatorId: 'ind1_1_1', condition: 'includes', value: ['Empleo precario', 'Empleo tiempo parcial no deseado', 'Empleo estable tiempo completo'] }
                    },
                    {
                        id: 'ind1_3_3',
                        label: 'Explotación laboral',
                        type: 'boolean',
                        description: 'Indicadores: horas extra no pagadas, retención de documentos, amenazas, condiciones degradantes, salario muy inferior al mínimo.',
                        dependsOn: { indicatorId: 'ind1_1_1', condition: 'includes', value: ['Empleo precario', 'Empleo tiempo parcial no deseado', 'Empleo estable tiempo completo'] }
                    },
                    {
                        id: 'ind1_3_4',
                        label: 'Protección social laboral',
                        type: 'select',
                        options: ['< 25% cobertura', '25-75% cobertura', '> 75% cobertura'],
                        description: 'Cobertura: cotización SS, seguro accidentes, baja por enfermedad, vacaciones pagadas, indemnización.',
                        dependsOn: { indicatorId: 'ind1_1_1', condition: 'includes', value: ['Empleo precario', 'Empleo tiempo parcial no deseado', 'Empleo estable tiempo completo'] }
                    },
                    {
                        id: 'ind1_3_5',
                        label: 'Compatibilidad vida-trabajo',
                        type: 'select',
                        options: ['Incompatible', 'Difícil', 'Compatible'],
                        description: '¿Puede atender responsabilidades familiares (menores, dependientes)? Considere horarios, desplazamientos, flexibilidad.',
                        dependsOn: { indicatorId: 'ind1_1_1', condition: 'includes', value: ['Empleo precario', 'Empleo tiempo parcial no deseado', 'Empleo estable tiempo completo'] }
                    }
                ]
            }
        ],
        risks: [
            { id: 'risk_d1_1', label: 'Desempleo de larga duración (> 12 meses)' },
            { id: 'risk_d1_2', label: 'Empleo precario repetitivo' },
            { id: 'risk_d1_3', label: 'Ingresos por debajo del umbral de pobreza (< 60% renta mediana)' },
            { id: 'risk_d1_4', label: 'Imposibilidad de hacer frente a gastos básicos' },
            { id: 'risk_d1_5', label: 'Endeudamiento superior a 36 meses de ingresos' },
            { id: 'risk_d1_6', label: 'Exclusión del sistema de prestaciones' }
        ],
        potentialities: [
            { id: 'pot_d1_1', label: 'Experiencia laboral previa demostrable' },
            { id: 'pot_d1_2', label: 'Formación profesional o titulación reconocida' },
            { id: 'pot_d1_3', label: 'Habilidades técnicas o artesanales específicas' },
            { id: 'pot_d1_4', label: 'Alta motivación para la inserción laboral' },
            { id: 'pot_d1_5', label: 'Red de contactos profesionales activa' },
            { id: 'pot_d1_6', label: 'Capacidad de ahorro o gestión económica' },
            { id: 'pot_d1_7', label: 'Acceso a recursos de empleabilidad (cursos, orientación)' },
            { id: 'pot_d1_8', label: 'Permiso de trabajo vigente' }
        ]
    },

    dim2: {
        id: 'dim2',
        title: 'Vivienda y Hábitat',
        description: 'Capacidad de acceder y mantener una vivienda con estándares mínimos de dignidad, seguridad y salubridad en entornos que faciliten la integración social.',
        subdimensions: [
            {
                id: 'sub2_1',
                title: 'Acceso y Estabilidad Residencial',
                description: 'Evalúe la situación actual de alojamiento, estabilidad residencial y riesgo de pérdida de vivienda. Considere sinhogarismo según tipología ETHOS.',
                indicators: [
                    { id: 'ind2_1_1', label: 'Situación residencial', type: 'select', options: ['Sinhogarismo', 'Vivienda precaria', 'Alojamiento temporal', 'Alquiler', 'Propiedad'] },
                    // Proporción ingreso solo si tiene vivienda estable
                    {
                        id: 'ind2_1_2', label: 'Proporción ingreso en vivienda', type: 'select', options: ['> 50%', '30-50%', '< 30%'],
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'includes', value: ['Alquiler', 'Propiedad'] }
                    },
                    {
                        id: 'ind2_1_3', label: 'Riesgo de desahucio', type: 'select', options: ['Muy alto', 'Moderado', 'Inexistente'],
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'includes', value: ['Alquiler', 'Propiedad'] }
                    },
                    { id: 'ind2_1_4', label: 'Estabilidad del alojamiento', type: 'select', options: ['< 6 meses', '6 meses - 3 años', '> 3 años'] },
                    { id: 'ind2_1_5', label: 'Movilidad forzada frecuente', type: 'boolean' },
                    // Motivo movilidad forzada
                    {
                        id: 'ind2_1_5b', label: 'Motivo principal movilidad', type: 'select', options: ['Económico', 'Desahucio', 'Violencia', 'Laboral', 'Familiar'],
                        dependsOn: { indicatorId: 'ind2_1_5', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind2_1_6', label: 'Acceso vivienda emergencia', type: 'select', options: ['Inexistente', 'Disponible'] },
                    // Tiempo en sinhogarismo solo si está en sinhogarismo
                    {
                        id: 'ind2_1_7', label: 'Tiempo en situación de calle (meses)', type: 'number',
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'equals', value: 'Sinhogarismo' }
                    },
                    // Uso de recursos para sinhogar
                    {
                        id: 'ind2_1_8', label: 'Uso de albergues/recursos', type: 'select', options: ['Nunca', 'Ocasional', 'Regular'],
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'equals', value: 'Sinhogarismo' }
                    }
                ]
            },
            {
                id: 'sub2_2',
                title: 'Condiciones Físicas y Habitabilidad',
                description: 'Valore los elementos básicos de habitabilidad: suministros, salubridad, estructura y espacio. Solo aplica si tiene vivienda física.',
                indicators: [
                    {
                        id: 'ind2_2_1', label: 'Agua corriente potable', type: 'boolean',
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'notEquals', value: 'Sinhogarismo' }
                    },
                    {
                        id: 'ind2_2_2', label: 'Saneamiento (baño con privacidad)', type: 'boolean',
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'notEquals', value: 'Sinhogarismo' }
                    },
                    {
                        id: 'ind2_2_3', label: 'Electricidad segura', type: 'boolean',
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'notEquals', value: 'Sinhogarismo' }
                    },
                    {
                        id: 'ind2_2_4', label: 'Calefacción/temperatura adecuada', type: 'boolean',
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'notEquals', value: 'Sinhogarismo' }
                    },
                    {
                        id: 'ind2_2_5', label: 'Estructuras íntegras', type: 'boolean',
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'notEquals', value: 'Sinhogarismo' }
                    },
                    {
                        id: 'ind2_2_6', label: 'Humedad y moho', type: 'boolean',
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'notEquals', value: 'Sinhogarismo' }
                    },
                    {
                        id: 'ind2_2_7', label: 'Control de plagas', type: 'boolean',
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'notEquals', value: 'Sinhogarismo' }
                    },
                    {
                        id: 'ind2_2_8', label: 'Ventilación adecuada', type: 'boolean',
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'notEquals', value: 'Sinhogarismo' }
                    },
                    {
                        id: 'ind2_2_9', label: 'Iluminación natural', type: 'boolean',
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'notEquals', value: 'Sinhogarismo' }
                    },
                    {
                        id: 'ind2_2_10', label: 'Hacinamiento (> 2 personas/habitación)', type: 'boolean',
                        dependsOn: { indicatorId: 'ind2_1_1', condition: 'notEquals', value: 'Sinhogarismo' }
                    }
                ]
            },
            {
                id: 'sub2_3',
                title: 'Entorno y Localización',
                description: 'Analice el entorno urbano: accesibilidad, seguridad, servicios y relación con la comunidad. Afecta a la inserción social.',
                indicators: [
                    { id: 'ind2_3_1', label: 'Acceso transporte público', type: 'select', options: ['> 45 min', '15-45 min', '< 15 min'] },
                    { id: 'ind2_3_2', label: 'Distancia servicios básicos', type: 'select', options: ['> 2 km', '500m - 2km', '< 500m'] },
                    { id: 'ind2_3_3', label: 'Seguridad del entorno', type: 'select', options: ['Alto riesgo', 'Moderado', 'Bajo riesgo'] },
                    // Tipo de inseguridad solo si hay alto riesgo
                    {
                        id: 'ind2_3_3b', label: 'Tipo de inseguridad', type: 'select', options: ['Delincuencia', 'Drogas', 'Violencia', 'Abandono urbano', 'Múltiple'],
                        dependsOn: { indicatorId: 'ind2_3_3', condition: 'equals', value: 'Alto riesgo' }
                    },
                    { id: 'ind2_3_4', label: 'Ruido y contaminación', type: 'select', options: ['Excesivos', 'Moderados', 'Tolerables'] },
                    { id: 'ind2_3_5', label: 'Espacios públicos/áreas verdes', type: 'boolean' },
                    { id: 'ind2_3_6', label: 'Integración comunitaria', type: 'select', options: ['Conflictiva', 'Neutral', 'Buena'] },
                    // Motivo conflicto comunitario
                    {
                        id: 'ind2_3_6b', label: 'Motivo conflicto comunitario', type: 'select', options: ['Étnico', 'Económico', 'Conducta', 'Ruido', 'Otro'],
                        dependsOn: { indicatorId: 'ind2_3_6', condition: 'equals', value: 'Conflictiva' }
                    }
                ]
            }
        ],
        risks: [
            { id: 'risk_d2_1', label: 'Sinhogarismo o cuasi-sinhogarismo' },
            { id: 'risk_d2_2', label: 'Vivienda precaria (chabolas, contenedores)' },
            { id: 'risk_d2_3', label: 'Alojamiento inseguro o temporal' },
            { id: 'risk_d2_4', label: 'Gasto en vivienda > 50% de ingresos' },
            { id: 'risk_d2_5', label: 'Riesgo inminente de desahucio' },
            { id: 'risk_d2_6', label: 'Hacinamiento (> 2 personas/habitación)' },
            { id: 'risk_d2_7', label: 'Vivienda sin condiciones de habitabilidad' },
            { id: 'risk_d2_8', label: 'Aislamiento geográfico del entorno' }
        ],
        potentialities: [
            { id: 'pot_d2_1', label: 'Vivienda estable y segura' },
            { id: 'pot_d2_2', label: 'Red familiar que puede ofrecer alojamiento temporal' },
            { id: 'pot_d2_3', label: 'Acceso a lista de vivienda social o protegida' },
            { id: 'pot_d2_4', label: 'Buena integración con vecinos/comunidad' },
            { id: 'pot_d2_5', label: 'Conocimiento de recursos de vivienda disponibles' },
            { id: 'pot_d2_6', label: 'Capacidad de mantener la vivienda (limpieza, cuidado)' },
            { id: 'pot_d2_7', label: 'Cercanía a servicios y transportes' },
            { id: 'pot_d2_8', label: 'Habilidades para pequeñas reparaciones domésticas' }
        ]
    },

    dim3: {
        id: 'dim3',
        title: 'Salud y Bienestar Físico',
        description: 'Estado de salud física, acceso equitativo a servicios sanitarios, prevención de enfermedades y calidad de vida relacionada con la salud.',
        subdimensions: [
            {
                id: 'sub3_1',
                title: 'Estado de Salud Física',
                description: 'Evalúe enfermedades crónicas, discapacidad, nutrición y sueño. Considere cómo afectan a la autonomía y calidad de vida.',
                indicators: [
                    { id: 'ind3_1_1', label: 'Enfermedades crónicas', type: 'select', options: ['Múltiples sin control', 'Alguna controlada', 'Ninguna'] },
                    // Tipo de enfermedad crónica solo si tiene alguna
                    {
                        id: 'ind3_1_1b', label: 'Principales enfermedades crónicas', type: 'text',
                        dependsOn: { indicatorId: 'ind3_1_1', condition: 'notEquals', value: 'Ninguna' }
                    },
                    { id: 'ind3_1_2', label: 'Discapacidad física', type: 'select', options: ['Severa', 'Moderada', 'Leve', 'Nula'] },
                    // Grado de discapacidad solo si tiene discapacidad
                    {
                        id: 'ind3_1_2b', label: 'Grado de discapacidad reconocido (%)', type: 'number',
                        dependsOn: { indicatorId: 'ind3_1_2', condition: 'notEquals', value: 'Nula' }
                    },
                    { id: 'ind3_1_3', label: 'Accidentes/traumas recurrentes', type: 'boolean' },
                    { id: 'ind3_1_4', label: 'Estado nutricional', type: 'select', options: ['Malnutrición', 'Inadecuado', 'Adecuado'] },
                    // Inseguridad alimentaria solo si hay malnutrición
                    {
                        id: 'ind3_1_4b', label: 'Inseguridad alimentaria', type: 'select', options: ['Severa', 'Moderada', 'Leve'],
                        dependsOn: { indicatorId: 'ind3_1_4', condition: 'notEquals', value: 'Adecuado' }
                    },
                    { id: 'ind3_1_5', label: 'Calidad de sueño', type: 'select', options: ['Problemas severos', 'Problemas moderados', 'Normal'] },
                    // Medicación para dormir solo si hay problemas
                    {
                        id: 'ind3_1_5b', label: 'Uso de medicación para dormir', type: 'boolean',
                        dependsOn: { indicatorId: 'ind3_1_5', condition: 'notEquals', value: 'Normal' }
                    },
                    { id: 'ind3_1_6', label: 'Actividad física', type: 'select', options: ['Muy baja (sedentarismo)', 'Moderada', 'Adecuada'] },
                    { id: 'ind3_1_7', label: 'Higiene personal', type: 'select', options: ['Deficiente', 'Adecuada'] },
                    // Causa higiene deficiente
                    {
                        id: 'ind3_1_7b', label: 'Causa higiene deficiente', type: 'select', options: ['Falta recursos', 'Salud mental', 'Discapacidad', 'Sinhogarismo', 'Otro'],
                        dependsOn: { indicatorId: 'ind3_1_7', condition: 'equals', value: 'Deficiente' }
                    },
                    { id: 'ind3_1_8', label: 'Problemas de visión', type: 'boolean' },
                    // Corrección visual solo si hay problemas
                    {
                        id: 'ind3_1_8b', label: 'Acceso a corrección visual', type: 'select', options: ['Sin acceso', 'Parcial', 'Completo'],
                        dependsOn: { indicatorId: 'ind3_1_8', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind3_1_9', label: 'Problemas auditivos', type: 'boolean' },
                    // Corrección auditiva solo si hay problemas
                    {
                        id: 'ind3_1_9b', label: 'Acceso a audífonos/adaptación', type: 'select', options: ['Sin acceso', 'Parcial', 'Completo'],
                        dependsOn: { indicatorId: 'ind3_1_9', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind3_1_10', label: 'Problemas dentales', type: 'select', options: ['Severos', 'Moderados', 'Controlados'] },
                    // Acceso tratamiento dental solo si hay problemas
                    {
                        id: 'ind3_1_10b', label: 'Acceso a tratamiento dental', type: 'select', options: ['Sin acceso', 'Parcial', 'Completo'],
                        dependsOn: { indicatorId: 'ind3_1_10', condition: 'notEquals', value: 'Controlados' }
                    }
                ]
            },
            {
                id: 'sub3_2',
                title: 'Acceso a Servicios Sanitarios',
                description: 'Valore el acceso efectivo a atención médica: inscripción, tiempos de espera, medicamentos, prevención y barreras de acceso.',
                indicators: [
                    { id: 'ind3_2_1', label: 'Inscripción centro salud', type: 'boolean' },
                    { id: 'ind3_2_2', label: 'Acceso atención primaria', type: 'select', options: ['Imposible', 'Retrasado', 'Inmediato'] },
                    { id: 'ind3_2_3', label: 'Acceso atención especializada', type: 'select', options: ['Denegado', 'Lista espera prolongada', 'Acceso'] },
                    { id: 'ind3_2_4', label: 'Acceso a medicamentos', type: 'select', options: ['Nulo', 'Parcial', '100%'] },
                    { id: 'ind3_2_5', label: 'Automedicación por coste', type: 'boolean' },
                    { id: 'ind3_2_6', label: 'Prevención sanitaria', type: 'select', options: ['Nula', 'Parcial', 'Completa'] },
                    {
                        id: 'ind3_2_7', label: 'Seguimiento enfermedades crónicas', type: 'select', options: ['Nulo', 'Esporádico', 'Regular'],
                        dependsOn: { indicatorId: 'ind3_1_1', condition: 'notEquals', value: 'Ninguna' }
                    },
                    { id: 'ind3_2_8', label: 'Barreras económicas (copagos)', type: 'boolean' },
                    { id: 'ind3_2_9', label: 'Barreras culturales/idioma', type: 'boolean' },
                    // Idioma principal si hay barrera de idioma
                    {
                        id: 'ind3_2_9b', label: 'Idioma principal', type: 'text',
                        dependsOn: { indicatorId: 'ind3_2_9', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind3_2_10', label: 'Barreras de movilidad', type: 'boolean' },
                    // Tipo de barrera movilidad
                    {
                        id: 'ind3_2_10b', label: 'Tipo barrera movilidad', type: 'select', options: ['Discapacidad', 'Transporte', 'Distancia', 'Económica'],
                        dependsOn: { indicatorId: 'ind3_2_10', condition: 'equals', value: 'yes' }
                    }
                ]
            },
            {
                id: 'sub3_3',
                title: 'Factores de Riesgo para la Salud',
                description: 'Identifique hábitos y exposiciones que afectan a la salud: consumo de sustancias, violencia, estrés e higiene ambiental.',
                indicators: [
                    { id: 'ind3_3_1', label: 'Tabaquismo', type: 'select', options: ['Intenso', 'Moderado', 'Nulo'] },
                    { id: 'ind3_3_2', label: 'Consumo de alcohol', type: 'select', options: ['Riesgo alto', 'Moderado', 'Bajo'] },
                    // Tratamiento alcoholismo solo si riesgo alto
                    {
                        id: 'ind3_3_2b', label: 'En tratamiento alcoholismo', type: 'boolean',
                        dependsOn: { indicatorId: 'ind3_3_2', condition: 'equals', value: 'Riesgo alto' }
                    },
                    { id: 'ind3_3_3', label: 'Consumo de sustancias', type: 'select', options: ['Activo', 'Pasado', 'Nulo'] },
                    // Tipo de sustancia solo si consume
                    {
                        id: 'ind3_3_3b', label: 'Sustancias principales', type: 'text',
                        dependsOn: { indicatorId: 'ind3_3_3', condition: 'notEquals', value: 'Nulo' }
                    },
                    // Tratamiento drogas solo si consumo activo
                    {
                        id: 'ind3_3_3c', label: 'En tratamiento adicciones', type: 'boolean',
                        dependsOn: { indicatorId: 'ind3_3_3', condition: 'equals', value: 'Activo' }
                    },
                    { id: 'ind3_3_4', label: 'Violencia sufrida', type: 'select', options: ['Actual', 'Pasada', 'Nunca'] },
                    // Tipo de violencia solo si la ha sufrido
                    {
                        id: 'ind3_3_4b', label: 'Tipo de violencia', type: 'select', options: ['Física', 'Psicológica', 'Sexual', 'Económica', 'Múltiple'],
                        dependsOn: { indicatorId: 'ind3_3_4', condition: 'notEquals', value: 'Nunca' }
                    },
                    { id: 'ind3_3_5', label: 'Estrés crónico', type: 'select', options: ['Severo', 'Moderado', 'Leve'] },
                    { id: 'ind3_3_6', label: 'Exposición contaminación/tóxicos', type: 'select', options: ['Alta', 'Moderada', 'Baja'] },
                    { id: 'ind3_3_7', label: 'Higiene ambiental hogar', type: 'select', options: ['Deficiente', 'Aceptable', 'Buena'] }
                ]
            }
        ],
        risks: [
            { id: 'risk_d3_1', label: 'Enfermedades crónicas sin control médico' },
            { id: 'risk_d3_2', label: 'Discapacidad física severa sin apoyos' },
            { id: 'risk_d3_3', label: 'Malnutrición o inseguridad alimentaria grave' },
            { id: 'risk_d3_4', label: 'Adicciones activas sin tratamiento' },
            { id: 'risk_d3_5', label: 'Violencia doméstica activa' },
            { id: 'risk_d3_6', label: 'Acceso nulo o muy limitado a servicios sanitarios' },
            { id: 'risk_d3_7', label: 'Falta de seguimiento de enfermedades graves' }
        ],
        potentialities: [
            { id: 'pot_d3_1', label: 'Buena salud general o enfermedades controladas' },
            { id: 'pot_d3_2', label: 'Adherencia al tratamiento médico' },
            { id: 'pot_d3_3', label: 'Acceso garantizado a atención sanitaria' },
            { id: 'pot_d3_4', label: 'Hábitos de vida saludables (alimentación, ejercicio)' },
            { id: 'pot_d3_5', label: 'Red de apoyo para cuidados de salud' },
            { id: 'pot_d3_6', label: 'Motivación para superar adicciones' },
            { id: 'pot_d3_7', label: 'Conocimiento sobre autocuidado y prevención' },
            { id: 'pot_d3_8', label: 'Capacidad funcional preservada' }
        ]
    },

    dim4: {
        id: 'dim4',
        title: 'Salud Mental y Bienestar Psicológico',
        description: 'Salud mental, trastornos mentales, capacidad de gestión emocional, resiliencia y factores que afectan al bienestar psicológico.',
        subdimensions: [
            {
                id: 'sub4_1',
                title: 'Estado de Salud Mental',
                description: 'Evalúe sintomatología: depresión, ansiedad, riesgo suicida, trastornos graves. URGENTE si hay ideación suicida activa.',
                indicators: [
                    { id: 'ind4_1_1', label: 'Síntomas depresivos', type: 'select', options: ['Severos', 'Moderados', 'Leves', 'Ausentes'] },
                    { id: 'ind4_1_2', label: 'Síntomas ansiosos', type: 'select', options: ['Severos', 'Moderados', 'Leves', 'Ausentes'] },
                    { id: 'ind4_1_3', label: 'Baja autoestima', type: 'select', options: ['Severa', 'Moderada', 'Leve', 'Normal'] },
                    { id: 'ind4_1_4', label: 'Ideación suicida', type: 'select', options: ['Activa', 'Pasada', 'Nunca'] },
                    // Plan suicida solo si hay ideación activa
                    {
                        id: 'ind4_1_4b', label: 'Plan suicida estructurado', type: 'boolean',
                        dependsOn: { indicatorId: 'ind4_1_4', condition: 'equals', value: 'Activa' }
                    },
                    { id: 'ind4_1_5', label: 'Intentos de suicidio', type: 'select', options: ['Reciente', 'Pasado', 'Nunca'] },
                    // Método de intento solo si hubo intento
                    {
                        id: 'ind4_1_5b', label: 'Letalidad del método', type: 'select', options: ['Alta', 'Media', 'Baja'],
                        dependsOn: { indicatorId: 'ind4_1_5', condition: 'notEquals', value: 'Nunca' }
                    },
                    { id: 'ind4_1_6', label: 'Autolesiones', type: 'select', options: ['Activas', 'Pasadas', 'Nunca'] },
                    // Frecuencia autolesiones solo si las hay
                    {
                        id: 'ind4_1_6b', label: 'Frecuencia autolesiones', type: 'select', options: ['Diaria', 'Semanal', 'Mensual', 'Esporádica'],
                        dependsOn: { indicatorId: 'ind4_1_6', condition: 'notEquals', value: 'Nunca' }
                    },
                    { id: 'ind4_1_7', label: 'Trastornos de personalidad', type: 'boolean' },
                    { id: 'ind4_1_8', label: 'Síntomas psicóticos', type: 'boolean' },
                    // Tipo de síntomas psicóticos solo si los tiene
                    {
                        id: 'ind4_1_8b', label: 'Tipo síntomas psicóticos', type: 'select', options: ['Alucinaciones', 'Delirios', 'Ambos'],
                        dependsOn: { indicatorId: 'ind4_1_8', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind4_1_9', label: 'TEPT (estrés postraumático)', type: 'boolean' },
                    // Evento traumático solo si tiene TEPT
                    {
                        id: 'ind4_1_9b', label: 'Tipo de trauma', type: 'select', options: ['Violencia', 'Accidente', 'Abuso', 'Guerra/conflicto', 'Otro'],
                        dependsOn: { indicatorId: 'ind4_1_9', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind4_1_10', label: 'Problemas cognitivos', type: 'boolean' }
                ]
            },
            {
                id: 'sub4_2',
                title: 'Acceso a Servicios de Salud Mental',
                description: 'Valore diagnóstico formal, tratamiento, adherencia y barreras de acceso a salud mental.',
                indicators: [
                    { id: 'ind4_2_1', label: 'Diagnóstico formal', type: 'select', options: ['Nunca', 'Pendiente', 'Realizado'] },
                    // Diagnóstico específico solo si está realizado
                    {
                        id: 'ind4_2_1b', label: 'Diagnóstico principal', type: 'text',
                        dependsOn: { indicatorId: 'ind4_2_1', condition: 'equals', value: 'Realizado' }
                    },
                    { id: 'ind4_2_2', label: 'Atención psicológica', type: 'select', options: ['Nunca', 'Completada', 'En tratamiento'] },
                    { id: 'ind4_2_3', label: 'Atención psiquiátrica', type: 'select', options: ['Nunca', 'Completada', 'En tratamiento'] },
                    {
                        id: 'ind4_2_4', label: 'Adherencia medicación', type: 'select', options: ['Nula', 'Parcial', 'Buena', 'No aplica'],
                        dependsOn: { indicatorId: 'ind4_2_3', condition: 'notEquals', value: 'Nunca' }
                    },
                    { id: 'ind4_2_5', label: 'Acceso sin barreras económicas', type: 'boolean' },
                    { id: 'ind4_2_6', label: 'Continuidad asistencial', type: 'boolean' },
                    { id: 'ind4_2_7', label: 'Tratamiento adaptado', type: 'boolean' }
                ]
            },
            {
                id: 'sub4_3',
                title: 'Factores de Resiliencia y Protección',
                indicators: [
                    { id: 'ind4_3_1', label: 'Estrategias de afrontamiento', type: 'select', options: ['Desadaptativas', 'Mixtas', 'Adaptativas'] },
                    { id: 'ind4_3_2', label: 'Apoyo social percibido', type: 'select', options: ['Nulo', 'Débil', 'Fuerte'] },
                    { id: 'ind4_3_3', label: 'Sentido de vida y metas', type: 'select', options: ['Ausente', 'Parcial', 'Presente'] },
                    { id: 'ind4_3_4', label: 'Esperanza en el futuro', type: 'select', options: ['Ausente', 'Parcial', 'Presente'] },
                    { id: 'ind4_3_5', label: 'Autonomía (toma decisiones)', type: 'select', options: ['Baja', 'Media', 'Alta'] },
                    { id: 'ind4_3_6', label: 'Sentimiento de pertenencia', type: 'select', options: ['Ausente', 'Parcial', 'Presente'] },
                    { id: 'ind4_3_7', label: 'Creencias espirituales', type: 'select', options: ['Limitantes', 'Neutras', 'Fortalecedoras'] }
                ]
            }
        ],
        risks: [
            { id: 'risk_d4_1', label: 'Ideación suicida activa' },
            { id: 'risk_d4_2', label: 'Intentos de suicidio recientes' },
            { id: 'risk_d4_3', label: 'Trastorno mental severo sin tratamiento' },
            { id: 'risk_d4_4', label: 'Alucinaciones o delirios sin control' },
            { id: 'risk_d4_5', label: 'Depresión severa o incapacitante' },
            { id: 'risk_d4_6', label: 'Automutilación activa' },
            { id: 'risk_d4_7', label: 'TEPT sin resolver' },
            { id: 'risk_d4_8', label: 'Falta total de apoyo social' }
        ],
        potentialities: [
            { id: 'pot_d4_1', label: 'Buena capacidad de insight y autoconocimiento' },
            { id: 'pot_d4_2', label: 'Adherencia a tratamiento psicológico/psiquiátrico' },
            { id: 'pot_d4_3', label: 'Red de apoyo emocional sólida' },
            { id: 'pot_d4_4', label: 'Resiliencia demostrada ante adversidades' },
            { id: 'pot_d4_5', label: 'Estrategías de afrontamiento saludables' },
            { id: 'pot_d4_6', label: 'Motivación para el cambio y la mejora personal' },
            { id: 'pot_d4_7', label: 'Experiencia positiva previa con tratamiento' },
            { id: 'pot_d4_8', label: 'Hobbies o actividades que proporcionan bienestar' }
        ]
    },

    dim5: {
        id: 'dim5',
        title: 'Educación y Competencias',
        description: 'Nivel educativo, acceso a educación de calidad, alfabetización, competencias digitales y capacidad de aprendizaje.',
        subdimensions: [
            {
                id: 'sub5_1',
                title: 'Niveles Educativos',
                indicators: [
                    { id: 'ind5_1_1', label: 'Nivel máximo alcanzado', type: 'select', options: ['Sin escolarizar', 'Primaria incompleta', 'Primaria', 'ESO', 'Bachillerato/FP', 'Universidad'] },
                    { id: 'ind5_1_2', label: 'Certificaciones oficiales', type: 'boolean' },
                    { id: 'ind5_1_3', label: 'Alfabetización lectura/escritura', type: 'select', options: ['Analfabeto', 'Alfabetización funcional', 'Alfabetizado'] },
                    // Programa alfabetización solo si analfabeto o funcional
                    {
                        id: 'ind5_1_3b', label: 'Participando en programa alfabetización', type: 'boolean',
                        dependsOn: { indicatorId: 'ind5_1_3', condition: 'notEquals', value: 'Alfabetizado' }
                    },
                    { id: 'ind5_1_4', label: 'Competencias digitales', type: 'select', options: ['Nulas', 'Básicas', 'Intermedias', 'Avanzadas'] },
                    // Formación digital si competencias nulas
                    {
                        id: 'ind5_1_4b', label: 'Acceso a formación digital', type: 'boolean',
                        dependsOn: { indicatorId: 'ind5_1_4', condition: 'equals', value: 'Nulas' }
                    },
                    { id: 'ind5_1_5', label: 'Acreditación competencias informales', type: 'boolean' },
                    { id: 'ind5_1_6', label: 'Cualificación profesional', type: 'boolean' },
                    { id: 'ind5_1_7', label: 'Idiomas adicionales', type: 'select', options: ['Ninguno', 'Básico', 'Fluido'] }
                ]
            },
            {
                id: 'sub5_2',
                title: 'Acceso a Educación',
                indicators: [
                    { id: 'ind5_2_1', label: 'Escolarización menores', type: 'select', options: ['Nunca escolarizado', 'Abandonado', 'Escolarizado', 'No aplica'] },
                    { id: 'ind5_2_2', label: 'Educación obligatoria completa', type: 'boolean' },
                    {
                        id: 'ind5_2_3', label: 'Absentismo escolar', type: 'select', options: ['Severo', 'Moderado', 'Bajo', 'No aplica'],
                        dependsOn: { indicatorId: 'ind5_2_1', condition: 'equals', value: 'Escolarizado' }
                    },
                    { id: 'ind5_2_4', label: 'Educación postobligatoria', type: 'select', options: ['Rechazado', 'En curso', 'Completado', 'No aplica'] },
                    { id: 'ind5_2_5', label: 'Educación permanente adulto', type: 'boolean' },
                    { id: 'ind5_2_6', label: 'Barreras económicas educación', type: 'boolean' },
                    { id: 'ind5_2_7', label: 'Discriminación educativa', type: 'boolean' },
                    // Motivo discriminación educativa
                    {
                        id: 'ind5_2_7b', label: 'Motivo discriminación educativa', type: 'select', options: ['Etnia', 'Discapacidad', 'Género', 'Origen', 'Económico', 'Otro'],
                        dependsOn: { indicatorId: 'ind5_2_7', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind5_2_8', label: 'Acceso educación inclusiva', type: 'boolean' },
                    // Tipo adaptaciones inclusivas
                    {
                        id: 'ind5_2_8b', label: 'Tipo de adaptaciones', type: 'select', options: ['Currículo', 'Acceso', 'Apoyo personal', 'Recursos', 'Múltiple'],
                        dependsOn: { indicatorId: 'ind5_2_8', condition: 'equals', value: 'yes' }
                    }
                ]
            },
            {
                id: 'sub5_3',
                title: 'Competencias y Habilidades',
                indicators: [
                    { id: 'ind5_3_1', label: 'Competencia comunicación', type: 'select', options: ['Severa dificultad', 'Dificultad', 'Adecuada', 'Buena'] },
                    { id: 'ind5_3_2', label: 'Competencia matemática', type: 'select', options: ['Severa dificultad', 'Dificultad', 'Adecuada', 'Buena'] },
                    { id: 'ind5_3_3', label: 'Competencia digital', type: 'select', options: ['Nula', 'Básica', 'Intermedia', 'Avanzada'] },
                    { id: 'ind5_3_4', label: 'Competencias empleabilidad', type: 'select', options: ['Severa carencia', 'Deficitarias', 'Adecuadas', 'Excelentes'] },
                    { id: 'ind5_3_5', label: 'Habilidades sociales', type: 'select', options: ['Severa deficiencia', 'Deficiencias', 'Adecuadas', 'Excelentes'] },
                    { id: 'ind5_3_6', label: 'Capacidad de aprendizaje', type: 'select', options: ['Muy limitada', 'Limitada', 'Buena', 'Muy buena'] }
                ]
            }
        ],
        risks: [
            { id: 'risk_d5_1', label: 'Analfabetismo o analfabetismo funcional' },
            { id: 'risk_d5_2', label: 'Educación obligatoria incompleta' },
            { id: 'risk_d5_3', label: 'Abandono escolar en menores' },
            { id: 'risk_d5_4', label: 'Absentismo crónico escolar' },
            { id: 'risk_d5_5', label: 'Sin cualificación profesional' },
            { id: 'risk_d5_6', label: 'Falta total de competencias digitales' },
            { id: 'risk_d5_7', label: 'Discriminación educativa activa' },
            { id: 'risk_d5_8', label: 'Discapacidad intelectual sin apoyos' }
        ],
        potentialities: [
            { id: 'pot_d5_1', label: 'Formación académica o profesional completada' },
            { id: 'pot_d5_2', label: 'Dominio de varios idiomas' },
            { id: 'pot_d5_3', label: 'Competencias digitales desarrolladas' },
            { id: 'pot_d5_4', label: 'Alta motivación para formarse' },
            { id: 'pot_d5_5', label: 'Experiencia en oficios o habilidades prácticas' },
            { id: 'pot_d5_6', label: 'Capacidad de aprendizaje demostrada' },
            { id: 'pot_d5_7', label: 'Acceso a recursos formativos (becas, cursos)' },
            { id: 'pot_d5_8', label: 'Menores con buen rendimiento escolar' }
        ]
    },

    dim6: {
        id: 'dim6',
        title: 'Relaciones Sociales, Familiares y Comunitarias',
        description: 'Calidad de relaciones interpersonales, apoyo social disponible, estructura familiar e integración comunitaria.',
        subdimensions: [
            {
                id: 'sub6_1',
                title: 'Estructura y Funcionamiento Familiar',
                indicators: [
                    { id: 'ind6_1_1', label: 'Composición familiar', type: 'select', options: ['Ninguna', 'Unipersonal', 'Monoparental', 'Nuclear biparental', 'Extensa'] },
                    {
                        id: 'ind6_1_2', label: 'Relaciones parentales', type: 'select', options: ['Ausentes', 'Rotas', 'Conflictivas', 'Positivas'],
                        dependsOn: { indicatorId: 'ind6_1_1', condition: 'notEquals', value: 'Unipersonal' }
                    },
                    {
                        id: 'ind6_1_3', label: 'Comunicación familiar', type: 'select', options: ['Deficiente', 'Parcial', 'Efectiva'],
                        dependsOn: { indicatorId: 'ind6_1_1', condition: 'notEquals', value: 'Unipersonal' }
                    },
                    { id: 'ind6_1_4', label: 'Cohabitación', type: 'select', options: ['Ausente', 'Intermitente', 'Regular'] },
                    { id: 'ind6_1_5', label: 'Responsabilidades de cuidado', type: 'boolean' },
                    {
                        id: 'ind6_1_6', label: 'Carga de cuidado', type: 'select', options: ['Severa', 'Moderada', 'Leve', 'Nula'],
                        dependsOn: { indicatorId: 'ind6_1_5', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind6_1_7', label: 'Apoyo intrafamiliar', type: 'boolean' },
                    { id: 'ind6_1_8', label: 'Violencia familiar', type: 'select', options: ['Activa', 'Pasada', 'Nunca'] },
                    { id: 'ind6_1_9', label: 'Separación/divorcio', type: 'select', options: ['Conflictiva', 'Pendiente', 'Amigable', 'No aplica'] }
                ]
            },
            {
                id: 'sub6_2',
                title: 'Redes de Apoyo Social',
                indicators: [
                    { id: 'ind6_2_1', label: 'Amistades significativas', type: 'select', options: ['Ninguna', 'Algunas', 'Múltiples'] },
                    { id: 'ind6_2_2', label: 'Contacto social regular', type: 'select', options: ['Nulo', 'Ocasional', 'Mensual', 'Semanal'] },
                    { id: 'ind6_2_3', label: 'Apoyo emocional disponible', type: 'boolean' },
                    { id: 'ind6_2_4', label: 'Apoyo económico disponible', type: 'boolean' },
                    { id: 'ind6_2_5', label: 'Apoyo material disponible', type: 'boolean' },
                    {
                        id: 'ind6_2_6', label: 'Reciprocidad en relaciones', type: 'select', options: ['Asimétrica', 'Equilibrada'],
                        dependsOn: { indicatorId: 'ind6_2_1', condition: 'notEquals', value: 'Ninguna' }
                    },
                    { id: 'ind6_2_7', label: 'Sentimiento de soledad', type: 'select', options: ['Severo', 'Moderado', 'Leve', 'Inexistente'] },
                    { id: 'ind6_2_8', label: 'Aislamiento social', type: 'boolean' },
                    // Causas del aislamiento solo si hay aislamiento
                    {
                        id: 'ind6_2_8b', label: 'Causa principal aislamiento', type: 'select', options: ['Enfermedad', 'Movilidad', 'Discriminación', 'Voluntario', 'Ubicación geográfica'],
                        dependsOn: { indicatorId: 'ind6_2_8', condition: 'equals', value: 'yes' }
                    }
                ]
            },
            {
                id: 'sub6_3',
                title: 'Integración Comunitaria',
                indicators: [
                    { id: 'ind6_3_1', label: 'Participación en asociaciones', type: 'select', options: ['Nula', 'Pasiva', 'Activa'] },
                    { id: 'ind6_3_2', label: 'Actividades comunitarias', type: 'select', options: ['Nula', 'Pasiva', 'Activa'] },
                    { id: 'ind6_3_3', label: 'Sentimiento de pertenencia', type: 'select', options: ['Ausente', 'Débil', 'Fuerte'] },
                    { id: 'ind6_3_4', label: 'Confianza en comunidad', type: 'select', options: ['Baja', 'Media', 'Alta'] },
                    { id: 'ind6_3_5', label: 'Conflictividad comunitaria', type: 'boolean' },
                    { id: 'ind6_3_6', label: 'Participación política local', type: 'boolean' },
                    { id: 'ind6_3_7', label: 'Espacios de encuentro', type: 'select', options: ['Ninguno', 'Limitados', 'Disponibles'] },
                    { id: 'ind6_3_8', label: 'Integración multicultural', type: 'select', options: ['Conflictiva', 'Tensa', 'Armónica'] }
                ]
            },
            {
                id: 'sub6_4',
                title: 'Situaciones de Riesgo en Relaciones',
                indicators: [
                    { id: 'ind6_4_1', label: 'Violencia de género', type: 'select', options: ['Activa', 'Pasada', 'Nunca'] },
                    // Orden de protección solo si violencia activa
                    {
                        id: 'ind6_4_1b', label: 'Orden de protección', type: 'select', options: ['Solicitada', 'Vigente', 'No solicitada'],
                        dependsOn: { indicatorId: 'ind6_4_1', condition: 'equals', value: 'Activa' }
                    },
                    { id: 'ind6_4_2', label: 'Abuso de menores', type: 'select', options: ['Activo', 'Pasado', 'Nunca'] },
                    // Intervención protección menores
                    {
                        id: 'ind6_4_2b', label: 'Intervención protección menores', type: 'boolean',
                        dependsOn: { indicatorId: 'ind6_4_2', condition: 'notEquals', value: 'Nunca' }
                    },
                    { id: 'ind6_4_3', label: 'Explotación laboral', type: 'boolean' },
                    { id: 'ind6_4_4', label: 'Situación de trata', type: 'boolean' },
                    // Tipo de trata
                    {
                        id: 'ind6_4_4b', label: 'Tipo de trata', type: 'select', options: ['Sexual', 'Laboral', 'Mendicidad', 'Otra'],
                        dependsOn: { indicatorId: 'ind6_4_4', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind6_4_5', label: 'Acoso (escolar, laboral, callejero)', type: 'boolean' },
                    // Tipo de acoso
                    {
                        id: 'ind6_4_5b', label: 'Tipo de acoso', type: 'select', options: ['Escolar', 'Laboral', 'Callejero', 'Digital', 'Múltiple'],
                        dependsOn: { indicatorId: 'ind6_4_5', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind6_4_6', label: 'Abandono/negligencia', type: 'boolean' }
                ]
            }
        ],
        risks: [
            { id: 'risk_d6_1', label: 'Aislamiento social completo' },
            { id: 'risk_d6_2', label: 'Violencia activa en relaciones' },
            { id: 'risk_d6_3', label: 'Pérdida de custodia de menores' },
            { id: 'risk_d6_4', label: 'Separación forzada de familia' },
            { id: 'risk_d6_5', label: 'Víctima activa de trata' },
            { id: 'risk_d6_6', label: 'Falta apoyo para cuidados' },
            { id: 'risk_d6_7', label: 'Familia en fragmentación/ruptura' }
        ],
        potentialities: [
            { id: 'pot_d6_1', label: 'Red familiar sólida y de apoyo' },
            { id: 'pot_d6_2', label: 'Amistades significativas y estables' },
            { id: 'pot_d6_3', label: 'Buenas habilidades sociales y comunicativas' },
            { id: 'pot_d6_4', label: 'Integración positiva en la comunidad' },
            { id: 'pot_d6_5', label: 'Participación en grupos o asociaciones' },
            { id: 'pot_d6_6', label: 'Capacidad de establecer vínculos de confianza' },
            { id: 'pot_d6_7', label: 'Apoyo comunitario disponible (vecinos, parroquia)' },
            { id: 'pot_d6_8', label: 'Relaciones familiares en proceso de mejora' }
        ]
    },

    dim7: {
        id: 'dim7',
        title: 'Participación Política y Ciudadanía',
        description: 'Capacidad y oportunidad para participar en procesos políticos, ejercer derechos ciudadanos y tener voz en decisiones.',
        subdimensions: [
            {
                id: 'sub7_1',
                title: 'Derechos Políticos Formales',
                indicators: [
                    { id: 'ind7_1_1', label: 'Registro electoral', type: 'boolean' },
                    { id: 'ind7_1_2', label: 'Derecho de voto', type: 'select', options: ['Impedido', 'No ejercido', 'Ejercido'] },
                    // Motivo impedimento voto
                    {
                        id: 'ind7_1_2b', label: 'Motivo impedimento voto', type: 'select', options: ['Nacionalidad', 'Incapacitación', 'Condena', 'Documentación'],
                        dependsOn: { indicatorId: 'ind7_1_2', condition: 'equals', value: 'Impedido' }
                    },
                    { id: 'ind7_1_3', label: 'Acceso a documentación', type: 'select', options: ['Ausente', 'Parcial', 'Presente'] },
                    // Documentos que faltan
                    {
                        id: 'ind7_1_3b', label: 'Documentos que faltan', type: 'text',
                        dependsOn: { indicatorId: 'ind7_1_3', condition: 'notEquals', value: 'Presente' }
                    },
                    { id: 'ind7_1_4', label: 'Nacionalidad/estatus', type: 'select', options: ['Irregular', 'Solicitante', 'Residente', 'Ciudadano'] },
                    // Tiempo en situación irregular
                    {
                        id: 'ind7_1_4b', label: 'Tiempo en situación irregular (años)', type: 'number',
                        dependsOn: { indicatorId: 'ind7_1_4', condition: 'equals', value: 'Irregular' }
                    },
                    // Tipo solicitud
                    {
                        id: 'ind7_1_4c', label: 'Tipo de solicitud', type: 'select', options: ['Asilo', 'Protección subsidiaria', 'Arraigo', 'Residencia', 'Otro'],
                        dependsOn: { indicatorId: 'ind7_1_4', condition: 'equals', value: 'Solicitante' }
                    },
                    { id: 'ind7_1_5', label: 'Impedimentos legales', type: 'boolean' },
                    // Tipo de impedimento legal
                    {
                        id: 'ind7_1_5b', label: 'Tipo de impedimento', type: 'select', options: ['Penal', 'Civil', 'Administrativo', 'Múltiple'],
                        dependsOn: { indicatorId: 'ind7_1_5', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind7_1_6', label: 'Acceso a justicia', type: 'select', options: ['Barreras idioma', 'Barreras económicas', 'Acceso'] }
                ]
            },
            {
                id: 'sub7_2',
                title: 'Acceso a Información y Derechos',
                indicators: [
                    { id: 'ind7_2_1', label: 'Conocimiento de derechos', type: 'select', options: ['Nulo', 'Parcial', 'Completo'] },
                    { id: 'ind7_2_2', label: 'Acceso información sobre derechos', type: 'select', options: ['Nula', 'Limitada', 'Accesible'] },
                    { id: 'ind7_2_3', label: 'Asesoramiento legal', type: 'select', options: ['Inaccesible', 'Gratuito disponible'] },
                    { id: 'ind7_2_4', label: 'Capacidad de denuncia', type: 'boolean' },
                    { id: 'ind7_2_5', label: 'Barreras de idioma', type: 'select', options: ['Severa', 'Moderada', 'Nula'] },
                    { id: 'ind7_2_6', label: 'Accesibilidad para discapacidad', type: 'boolean' }
                ]
            },
            {
                id: 'sub7_3',
                title: 'Participación Activa',
                indicators: [
                    {
                        id: 'ind7_3_1', label: 'Participación electoral', type: 'select', options: ['Nunca', 'Ocasional', 'Regular'],
                        dependsOn: { indicatorId: 'ind7_1_2', condition: 'notEquals', value: 'Impedido' }
                    },
                    { id: 'ind7_3_2', label: 'Participación en organizaciones', type: 'select', options: ['Nula', 'Pasiva', 'Activa'] },
                    { id: 'ind7_3_3', label: 'Participación comunitaria', type: 'select', options: ['Nula', 'Pasiva', 'Activa'] },
                    { id: 'ind7_3_4', label: 'Voz en decisiones que afectan', type: 'select', options: ['Nula', 'Limitada', 'Efectiva'] },
                    { id: 'ind7_3_5', label: 'Movilización social', type: 'boolean' },
                    { id: 'ind7_3_6', label: 'Liderazgo comunitario', type: 'boolean' }
                ]
            },
            {
                id: 'sub7_4',
                title: 'Conflictividad Social y Exclusión Política',
                indicators: [
                    { id: 'ind7_4_1', label: 'Discriminación política', type: 'boolean' },
                    { id: 'ind7_4_2', label: 'Estigmatización', type: 'boolean' },
                    { id: 'ind7_4_3', label: 'Exclusión comunitaria', type: 'boolean' },
                    { id: 'ind7_4_4', label: 'Conflictividad con instituciones', type: 'boolean' },
                    { id: 'ind7_4_5', label: 'Desconfianza institucional', type: 'select', options: ['Severa', 'Moderada', 'Baja'] },
                    { id: 'ind7_4_6', label: 'Experiencia de injusticia', type: 'boolean' }
                ]
            }
        ],
        risks: [
            { id: 'risk_d7_1', label: 'Falta documentación/estatus irregular' },
            { id: 'risk_d7_2', label: 'Analfabetismo cívico' },
            { id: 'risk_d7_3', label: 'Impedimento legal para participar' },
            { id: 'risk_d7_4', label: 'Discriminación política activa' },
            { id: 'risk_d7_5', label: 'Desconfianza severa instituciones' },
            { id: 'risk_d7_6', label: 'Sin acceso a asesoría legal' },
            { id: 'risk_d7_7', label: 'Falta representación en decisiones' },
            { id: 'risk_d7_8', label: 'Exclusión procesos políticos' }
        ],
        potentialities: [
            { id: 'pot_d7_1', label: 'Documentación en regla y acceso a derechos' },
            { id: 'pot_d7_2', label: 'Conocimiento de derechos ciudadanos' },
            { id: 'pot_d7_3', label: 'Participación activa en asociaciones' },
            { id: 'pot_d7_4', label: 'Interés en la vida comunitaria y política' },
            { id: 'pot_d7_5', label: 'Acceso a servicios sociales públicos' },
            { id: 'pot_d7_6', label: 'Vínculo con ONG o entidades de apoyo' },
            { id: 'pot_d7_7', label: 'Capacidad de advocacy (defensa de sus derechos)' },
            { id: 'pot_d7_8', label: 'Proceso de regularización en curso favorable' }
        ]
    },

    dim8: {
        id: 'dim8',
        title: 'Situación Legal y Conflictividad Social',
        description: 'Situación legal, antecedentes penales, procesos legales, victimización, conflictividad social y estatus de residencia/extranjería.',
        subdimensions: [
            {
                id: 'sub8_0',
                title: 'Situación de Residencia y Extranjería',
                description: 'Evalúe el estatus administrativo de la persona si es de origen extranjero: permisos, documentación, procesos de regularización y riesgo de expulsión.',
                indicators: [
                    {
                        id: 'ind8_0_1',
                        label: 'Nacionalidad',
                        type: 'select',
                        options: ['Española', 'UE/EEE', 'Extracomunitaria con permiso', 'Extracomunitaria sin permiso', 'Apátrida'],
                        description: 'Identifique la situación de nacionalidad. UE/EEE incluye ciudadanos de la Unión Europea y Espacio Económico Europeo.'
                    },
                    {
                        id: 'ind8_0_2',
                        label: 'Tipo de permiso de residencia',
                        type: 'select',
                        options: ['No aplica (español)', 'Comunitario', 'Temporal', 'Larga duración', 'Arraigo', 'Humanitario', 'En trámite', 'Denegado/Sin permiso'],
                        description: 'Tipo de autorización de residencia vigente. Arraigo puede ser social, laboral o familiar.',
                        dependsOn: { indicatorId: 'ind8_0_1', condition: 'notEquals', value: 'Española' }
                    },
                    {
                        id: 'ind8_0_3',
                        label: 'Permiso de trabajo',
                        type: 'select',
                        options: ['No aplica', 'Sí autorizado', 'Limitado (sector/zona)', 'No autorizado', 'En trámite'],
                        description: '¿Tiene autorización para trabajar legalmente? Algunos permisos limitan sectores o zonas geográficas.',
                        dependsOn: { indicatorId: 'ind8_0_1', condition: 'notEquals', value: 'Española' }
                    },
                    {
                        id: 'ind8_0_4',
                        label: 'Tiempo en situación irregular',
                        type: 'select',
                        options: ['No aplica', '< 6 meses', '6 meses - 2 años', '2-3 años (arraigo)', '> 3 años'],
                        description: 'Tiempo transcurrido en situación administrativa irregular. 3 años posibilita arraigo social.',
                        dependsOn: { indicatorId: 'ind8_0_2', condition: 'equals', value: 'Denegado/Sin permiso' }
                    },
                    {
                        id: 'ind8_0_5',
                        label: 'Documentación acreditativa',
                        type: 'select',
                        options: ['Pasaporte vigente', 'Pasaporte caducado', 'Sin pasaporte', 'NIE vigente', 'NIE caducado', 'TIE vigente', 'Sin documentación'],
                        description: 'Estado de la documentación identificativa. TIE = Tarjeta de Identidad de Extranjero.'
                    },
                    {
                        id: 'ind8_0_6',
                        label: 'Empadronamiento',
                        type: 'select',
                        options: ['Empadronado/a', 'En trámite', 'Sin empadronamiento'],
                        description: 'El empadronamiento es requisito para acceso a servicios y para acreditar arraigo. Todos tienen derecho a empadronarse.'
                    },
                    {
                        id: 'ind8_0_7',
                        label: 'Procedimiento de expulsión',
                        type: 'select',
                        options: ['No', 'Orden de expulsión activa', 'Devolución en frontera', 'CIE internamiento', 'Recurrido'],
                        description: '¿Existe procedimiento sancionador de expulsión? CIE = Centro de Internamiento de Extranjeros.',
                        dependsOn: { indicatorId: 'ind8_0_1', condition: 'notEquals', value: 'Española' }
                    },
                    {
                        id: 'ind8_0_8',
                        label: 'Solicitud de protección internacional',
                        type: 'select',
                        options: ['No aplica', 'Solicitante asilo', 'Refugiado/a', 'Protección subsidiaria', 'Denegada'],
                        description: 'Estado de solicitud de asilo o protección internacional.',
                        dependsOn: { indicatorId: 'ind8_0_1', condition: 'notEquals', value: 'Española' }
                    },
                    {
                        id: 'ind8_0_9',
                        label: 'Acceso a tarjeta sanitaria',
                        type: 'select',
                        options: ['TSI completa', 'TSI limitada', 'Solo urgencias', 'Sin acceso'],
                        description: 'Tipo de cobertura sanitaria. TSI = Tarjeta Sanitaria Individual.'
                    },
                    {
                        id: 'ind8_0_10',
                        label: 'Asesoramiento jurídico extranjería',
                        type: 'boolean',
                        description: '¿Tiene acceso a asesoramiento legal especializado en extranjería?'
                    }
                ]
            },
            {
                id: 'sub8_1',
                title: 'Antecedentes y Situación Legal',
                description: 'Evalúe antecedentes penales, procedimientos judiciales activos, condenas y deudas judiciales.',
                indicators: [
                    {
                        id: 'ind8_1_1',
                        label: 'Antecedentes penales',
                        type: 'boolean',
                        description: '¿Tiene antecedentes penales vigentes o cancelados? Los antecedentes se cancelan tras cierto tiempo según gravedad.'
                    },
                    {
                        id: 'ind8_1_2',
                        label: 'Tipo de delitos',
                        type: 'select',
                        options: ['Ninguno', 'No violentos', 'Violentos'],
                        description: 'No violentos: hurtos, estafas, tráfico menor. Violentos: lesiones, robos con fuerza, delitos sexuales.',
                        dependsOn: { indicatorId: 'ind8_1_1', condition: 'equals', value: 'yes' }
                    },
                    {
                        id: 'ind8_1_3',
                        label: 'Procedimientos judiciales activos',
                        type: 'boolean',
                        description: '¿Tiene causas penales, civiles o administrativas actualmente en curso?'
                    },
                    {
                        id: 'ind8_1_4',
                        label: 'Condenas activas',
                        type: 'boolean',
                        description: '¿Tiene sentencias condenatorias pendientes de cumplimiento?',
                        dependsOn: { indicatorId: 'ind8_1_1', condition: 'equals', value: 'yes' }
                    },
                    {
                        id: 'ind8_1_5',
                        label: 'Situación penitenciaria',
                        type: 'select',
                        options: ['Nunca', 'Completado', 'Cumpliendo'],
                        description: 'Estado respecto a cumplimiento de penas privativas de libertad.',
                        dependsOn: { indicatorId: 'ind8_1_1', condition: 'equals', value: 'yes' }
                    },
                    {
                        id: 'ind8_1_6',
                        label: 'Deudas judiciales',
                        type: 'boolean',
                        description: 'Multas, responsabilidades civiles, costas procesales pendientes de pago.'
                    },
                    {
                        id: 'ind8_1_7',
                        label: 'Prohibiciones judiciales',
                        type: 'boolean',
                        description: 'Órdenes de alejamiento, inhabilitaciones, prohibición de aproximarse a personas o lugares.'
                    },
                    {
                        id: 'ind8_1_8',
                        label: 'Historial detenciones',
                        type: 'select',
                        options: ['Ninguna', 'Ocasionales', 'Frecuentes'],
                        description: 'Frecuencia de detenciones policiales, aunque no resultaran en condena.'
                    }
                ]
            },
            {
                id: 'sub8_2',
                title: 'Victimización y Violencia Sufrida',
                description: 'Identifique si la persona ha sido víctima de delitos, violencia o discriminación, y su acceso a protección.',
                indicators: [
                    {
                        id: 'ind8_2_1',
                        label: 'Delitos sufridos (robo, asalto)',
                        type: 'boolean',
                        description: '¿Ha sido víctima de delitos contra su persona o patrimonio?'
                    },
                    {
                        id: 'ind8_2_2',
                        label: 'Violencia de género sufrida',
                        type: 'boolean',
                        description: 'Violencia física, psicológica, sexual o económica por parte de pareja o ex-pareja.'
                    },
                    // Denuncia violencia género
                    {
                        id: 'ind8_2_2b',
                        label: 'Denuncia interpuesta VG',
                        type: 'boolean',
                        description: '¿Ha interpuesto denuncia? Valorar barreras: miedo, dependencia, desconocimiento.',
                        dependsOn: { indicatorId: 'ind8_2_2', condition: 'equals', value: 'yes' }
                    },
                    {
                        id: 'ind8_2_3',
                        label: 'Violencia familiar sufrida',
                        type: 'boolean',
                        description: 'Maltrato por parte de familiares (padres, hijos, hermanos, etc.).'
                    },
                    {
                        id: 'ind8_2_4',
                        label: 'Abuso sexual sufrido',
                        type: 'boolean',
                        description: 'Incluye agresiones sexuales, abusos en la infancia, explotación sexual.'
                    },
                    // Atención especializada abuso
                    {
                        id: 'ind8_2_4b',
                        label: 'Atención especializada recibida',
                        type: 'boolean',
                        description: '¿Ha recibido atención psicológica o de servicios especializados?',
                        dependsOn: { indicatorId: 'ind8_2_4', condition: 'equals', value: 'yes' }
                    },
                    {
                        id: 'ind8_2_5',
                        label: 'Acoso sufrido',
                        type: 'boolean',
                        description: 'Acoso laboral (mobbing), escolar (bullying), callejero o digital.'
                    },
                    {
                        id: 'ind8_2_6',
                        label: 'Discriminación sufrida',
                        type: 'boolean',
                        description: 'Trato desigual por origen, género, discapacidad, orientación sexual, etc.'
                    },
                    // Tipo de discriminación
                    {
                        id: 'ind8_2_6b',
                        label: 'Motivo discriminación',
                        type: 'select',
                        options: ['Etnia', 'Género', 'Orientación sexual', 'Discapacidad', 'Religión', 'Otro'],
                        dependsOn: { indicatorId: 'ind8_2_6', condition: 'equals', value: 'yes' }
                    },
                    {
                        id: 'ind8_2_7',
                        label: 'Denuncias por victimización',
                        type: 'boolean',
                        description: '¿Ha denunciado las situaciones de victimización sufridas?'
                    },
                    {
                        id: 'ind8_2_8',
                        label: 'Protección para víctimas',
                        type: 'select',
                        options: ['Innecesaria', 'Presente', 'Necesaria ausente'],
                        description: 'Órdenes de protección, programas de víctimas, recursos de acogida.'
                    }
                ]
            },
            {
                id: 'sub8_3',
                title: 'Conflictividad Social y Riesgos',
                description: 'Valore la posible vinculación con entornos de riesgo, conflictividad interpersonal y problemas de conducta.',
                indicators: [
                    {
                        id: 'ind8_3_1',
                        label: 'Pertenencia grupos de riesgo',
                        type: 'boolean',
                        description: 'Bandas, grupos organizados, sectas u otras organizaciones de riesgo.'
                    },
                    // Tipo de grupo de riesgo
                    {
                        id: 'ind8_3_1b', label: 'Tipo de grupo', type: 'select', options: ['Banda juvenil', 'Organización criminal', 'Secta', 'Otro'],
                        dependsOn: { indicatorId: 'ind8_3_1', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind8_3_2', label: 'Red contactos de riesgo', type: 'select', options: ['Nula', 'Limitada', 'Significativa'] },
                    { id: 'ind8_3_3', label: 'Implicación narcotráfico', type: 'select', options: ['Nunca', 'Pasada', 'Activa'] },
                    // Rol en narcotráfico
                    {
                        id: 'ind8_3_3b', label: 'Rol en narcotráfico', type: 'select', options: ['Consumidor', 'Menudeo', 'Distribución', 'Producción'],
                        dependsOn: { indicatorId: 'ind8_3_3', condition: 'notEquals', value: 'Nunca' }
                    },
                    { id: 'ind8_3_4', label: 'Violencia interpersonal', type: 'select', options: ['Nunca', 'Ocasional', 'Frecuente'] },
                    { id: 'ind8_3_5', label: 'Posesión de armas', type: 'boolean' },
                    // Tipo de armas
                    {
                        id: 'ind8_3_5b', label: 'Tipo de armas', type: 'select', options: ['Blancas', 'Fuego', 'Ambas'],
                        dependsOn: { indicatorId: 'ind8_3_5', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind8_3_6', label: 'Conflictividad familiar', type: 'boolean' },
                    { id: 'ind8_3_7', label: 'Conflictividad vecinal', type: 'boolean' },
                    { id: 'ind8_3_8', label: 'Problemas de conducta', type: 'select', options: ['Ninguno', 'Leves', 'Moderados', 'Severos'] }
                ]
            },
            {
                id: 'sub8_4',
                title: 'Acceso a Justicia y Protección Legal',
                description: 'Evalúe el acceso efectivo a la justicia, asesoramiento legal y garantías procesales.',
                indicators: [
                    {
                        id: 'ind8_4_1',
                        label: 'Acceso asesoramiento legal',
                        type: 'boolean',
                        description: '¿Tiene acceso a servicios de orientación jurídica gratuitos o puede costear abogado?'
                    },
                    { id: 'ind8_4_2', label: 'Acceso a abogado', type: 'select', options: ['Inaccesible', 'Disponible'] },
                    { id: 'ind8_4_3', label: 'Conocimiento derechos procesales', type: 'select', options: ['Nulo', 'Parcial', 'Completo'] },
                    { id: 'ind8_4_4', label: 'Garantías procesales', type: 'select', options: ['Vulneradas', 'Presentes'] },
                    { id: 'ind8_4_5', label: 'Discriminación en justicia', type: 'boolean' },
                    {
                        id: 'ind8_4_6', label: 'Duración procesos', type: 'select', options: ['Estancada', 'Lenta', 'Normal', 'Rápida'],
                        dependsOn: { indicatorId: 'ind8_1_3', condition: 'equals', value: 'yes' }
                    },
                    { id: 'ind8_4_7', label: 'Ejecución sentencias', type: 'select', options: ['Nula', 'Parcial', 'Completa', 'No aplica'] }
                ]
            }
        ],
        risks: [
            { id: 'risk_d8_1', label: 'Antecedentes de delitos violentos' },
            { id: 'risk_d8_2', label: 'Procedimientos penales activos graves' },
            { id: 'risk_d8_3', label: 'Víctima activa de violencia grave' },
            { id: 'risk_d8_4', label: 'Pertenencia a grupos delictivos' },
            { id: 'risk_d8_5', label: 'Sin acceso a justicia/abogado' },
            { id: 'risk_d8_6', label: 'Discriminación sistemática en justicia' },
            { id: 'risk_d8_7', label: 'Riesgo inminente de prisión' },
            { id: 'risk_d8_8', label: 'Víctima de trata o explotación' },
            { id: 'risk_d8_9', label: 'Situación administrativa irregular' },
            { id: 'risk_d8_10', label: 'Orden de expulsión activa' },
            { id: 'risk_d8_11', label: 'Sin documentación de identidad' },
            { id: 'risk_d8_12', label: 'Sin acceso a tarjeta sanitaria' }
        ],
        potentialities: [
            { id: 'pot_d8_1', label: 'Sin antecedentes penales' },
            { id: 'pot_d8_2', label: 'Documentación de residencia en regla' },
            { id: 'pot_d8_3', label: 'Arraigo social acreditable (> 3 años)' },
            { id: 'pot_d8_4', label: 'Acceso efectivo a justicia gratuita' },
            { id: 'pot_d8_5', label: 'Conocimiento proceso de regularización' },
            { id: 'pot_d8_6', label: 'Red de apoyo para trámites legales' },
            { id: 'pot_d8_7', label: 'Empadronamiento vigente' },
            { id: 'pot_d8_8', label: 'Asesoramiento jurídico disponible' }
        ]
    }
};

/**
 * Evaluates if a dependency condition is met
 * @param {object} dependency - The dependency configuration { indicatorId, condition, value }
 * @param {object} answers - Current answers for the dimension
 * @returns {boolean} - True if the indicator should be shown
 */
export function evaluateDependency(dependency, answers) {
    if (!dependency) return true;

    const currentValue = answers[dependency.indicatorId];

    switch (dependency.condition) {
        case 'equals':
            return currentValue === dependency.value;
        case 'notEquals':
            return currentValue !== dependency.value && currentValue !== undefined && currentValue !== '';
        case 'includes':
            return Array.isArray(dependency.value) && dependency.value.includes(currentValue);
        default:
            return true;
    }
}

/**
 * Helper function to get all indicators across all dimensions
 */
export function getAllIndicators() {
    const all = [];
    Object.values(DIMENSIONS).forEach(dim => {
        dim.subdimensions.forEach(sub => {
            sub.indicators.forEach(ind => {
                all.push({
                    dimensionId: dim.id,
                    dimensionTitle: dim.title,
                    subdimensionId: sub.id,
                    subdimensionTitle: sub.title,
                    ...ind
                });
            });
        });
    });
    return all;
}

/**
 * Helper to count total indicators
 */
export function countIndicators() {
    let count = 0;
    Object.values(DIMENSIONS).forEach(dim => {
        dim.subdimensions.forEach(sub => {
            count += sub.indicators.length;
        });
    });
    return count;
}

/**
 * Helper to count indicators with dependencies
 */
export function countDependentIndicators() {
    let count = 0;
    Object.values(DIMENSIONS).forEach(dim => {
        dim.subdimensions.forEach(sub => {
            sub.indicators.forEach(ind => {
                if (ind.dependsOn) count++;
            });
        });
    });
    return count;
}
