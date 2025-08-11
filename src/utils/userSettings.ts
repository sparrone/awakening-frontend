interface UserSettings {
    threadsPerPage: number;
    postsPerPage: number;
    profilePostsPerPage: number;
}

const DEFAULT_SETTINGS: UserSettings = {
    threadsPerPage: 10,
    postsPerPage: 10,
    profilePostsPerPage: 10
};

export function getUserSettings(): UserSettings {
    try {
        const cached = localStorage.getItem('userSettings');
        if (cached) {
            const parsed = JSON.parse(cached);
            // Ensure all required fields exist with fallbacks
            return {
                threadsPerPage: parsed.threadsPerPage || DEFAULT_SETTINGS.threadsPerPage,
                postsPerPage: parsed.postsPerPage || DEFAULT_SETTINGS.postsPerPage,
                profilePostsPerPage: parsed.profilePostsPerPage || DEFAULT_SETTINGS.profilePostsPerPage
            };
        }
    } catch (err) {
        console.error('Failed to parse cached user settings:', err);
    }
    
    return DEFAULT_SETTINGS;
}

export function getThreadsPerPage(): number {
    return getUserSettings().threadsPerPage;
}

export function getPostsPerPage(): number {
    return getUserSettings().postsPerPage;
}

export function getProfilePostsPerPage(): number {
    return getUserSettings().profilePostsPerPage;
}