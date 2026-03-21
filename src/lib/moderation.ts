// Diccionario de Moderación Básico (MVP)
// Contiene términos groseros, agresivos o comerciales invasivos.
// Diseñado para mantener el respeto vecinal en Barrio Seguro.

const BANNED_WORDS = [
    // Garabatos Chilenos frecuentes
    'weon', 'weona', 'weón', 'weóna', 'wn', 'wna',
    'ctm', 'conchetumare', 'conchatumadre', 'conchesumadre',
    'qlo', 'qla', 'culiao', 'culiada', 'culia', 'ql',
    'maricon', 'maricón', 'fag', 'maraca', 'maraco',
    'puta', 'puto', 'perra', 'zorra', 'bastardo', 'bastarda',
    'aweonao', 'aweonada', 'ahueonao', 'aweonado',
    'chupalo', 'chúpalo', 'chupar', 'pico', 'tula', 'nepe', 'corneta', 'pichula',
    'mierda', 'caca', 'zorron', 'zorrón',

    // Insultos Universales (Esp)
    'idiota', 'imbecil', 'imbécil', 'estupido', 'estupida', 'estúpido', 'estúpida',
    'tarado', 'tarada', 'retrasado', 'retrasada',
    'hijo de puta', 'hdp', 'infeliz', 'desgraciado', 'desgraciada',
    'cabron', 'cabrón', 'cabrona', 'pendejo', 'pendeja',
    'mierdero', 'mierdera', 'asco',

    // Agresión Directa
    'te mato', 'matar', 'muerete', 'muérete', 'golpear', 'pegar', 'bala', 'balazo', 'puñalada',
    'robo', 'ladron', 'ladrón', 'estafa', 'estafador', 'rata',

    // Expresiones de Odio / Racismo
    'negro qlo', 'haiti', 'veneco', 'venezolano asqueroso', 'colombiano asqueroso',
    'indio', 'mapuche', 'flaite', 'pobreton', 'pobretón'
];

export function checkMessageModeration(message: string): { isValid: boolean, flaggedWords: string[] } {
    if (!message) return { isValid: true, flaggedWords: [] };

    const lowerMessage = message.toLowerCase();
    
    // Simplificar el texto (quitar tildes para la búsqueda)
    const normalizedMessage = lowerMessage.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const wordsInMessage = normalizedMessage.match(/\b\w+\b/g) || [];

    const flaggedWords: string[] = [];

    // Comprobación 1: Búsqueda exacta de palabra
    for (const word of wordsInMessage) {
        if (BANNED_WORDS.includes(word)) {
            flaggedWords.push(word);
        }
    }

    // Comprobación 2: Búsqueda de substring para detectar palabras compuestas (hdp, ctm)
    for (const banned of BANNED_WORDS) {
        if (normalizedMessage.includes(banned) && !flaggedWords.includes(banned)) {
            // Evaluamos si es una palabra real o falso positivo, pero para groserías fuertes a veces substring sirve
            flaggedWords.push(banned);
        }
    }

    // Limpieza de duplicados
    const uniqueFlagged = Array.from(new Set(flaggedWords));

    if (uniqueFlagged.length > 0) {
        return { isValid: false, flaggedWords: uniqueFlagged };
    }

    return { isValid: true, flaggedWords: [] };
}
