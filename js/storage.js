const PREFIX = 'm8p:';

export function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function load(key, fallback) {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

export function save(key, value) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export const Store = {
    get exercises() { return load('exercises', []); },
    set exercises(v) { save('exercises', v); },

    get templates() { return load('templates', []); },
    set templates(v) { save('templates', v); },

    get workouts() { return load('workouts', []); },
    set workouts(v) { save('workouts', v); },

    get weightEntries() { return load('weightEntries', []); },
    set weightEntries(v) { save('weightEntries', v); },

    get profile() { return load('profile', null); },
    set profile(v) { save('profile', v); },

    get weeklyPlan() { return load('weeklyPlan', null); },
    set weeklyPlan(v) { save('weeklyPlan', v); },
};
