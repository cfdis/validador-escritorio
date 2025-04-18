export class ThemeManager {
    applyTheme(theme: string): void {
        document.documentElement.classList.remove('dark')
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (prefersDark) {
                document.documentElement.classList.add('dark')
            }
        }
    }

    setTheme(theme: string): void {
        localStorage.setItem('theme', theme);
        this.applyTheme(theme);
    }

    initThemeSelector(): void {
        const select = document.querySelector('#theme-select') as HTMLSelectElement;

        const saved = localStorage.getItem('theme') || 'system';
        this.applyTheme(saved);

        if (saved === 'system') {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                this.applyTheme('system');
            });
        }

        if (select) {
            select.value = saved;
            select.addEventListener('change', (e) => this.setTheme((e.target as HTMLSelectElement).value));
        }
    }
}
