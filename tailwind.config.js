/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                togari: {
                    gold: '#CCA806',
                    dark: '#1d1d1d',
                    card: '#2a2a2a',
                }
            }
        },
    },
    plugins: [],
}
