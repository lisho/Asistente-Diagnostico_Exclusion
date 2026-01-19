const STORAGE_KEY = 'dx_exclusion_cases';

export const StorageService = {
    getAll: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading cases', e);
            return [];
        }
    },

    getById: (id) => {
        const cases = StorageService.getAll();
        return cases.find(c => c.id === id);
    },

    save: (caseData) => {
        const cases = StorageService.getAll();
        const existingIndex = cases.findIndex(c => c.id === caseData.id);

        // Add timestamp
        const dataToSave = {
            ...caseData,
            updatedAt: new Date().toISOString(),
        };

        if (existingIndex >= 0) {
            cases[existingIndex] = dataToSave;
        } else {
            // New case
            if (!dataToSave.id) {
                dataToSave.id = crypto.randomUUID();
                dataToSave.createdAt = new Date().toISOString();
            }
            cases.push(dataToSave);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
        return dataToSave;
    },

    delete: (id) => {
        const cases = StorageService.getAll();
        const newCases = cases.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCases));
    }
};
