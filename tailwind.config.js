/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['Cinzel', 'serif'],
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                void: '#0a0a0a',
                ash: '#1c1917',
                blood: '#450a0a',
                'blood-bright': '#7f1d1d',
                rust: '#b45309',
                orange: {
                    900: '#7c2d12',
                },
                gold: '#a16207',
                bone: '#e5e5e5',
                faded: '#a8a29e',
            },
            backgroundImage: {
                'cosmic-dust': "radial-gradient(circle at center, rgba(120, 53, 15, 0.05) 0%, rgba(0, 0, 0, 0) 70%)",
            }
        }
    },
    plugins: [],
}
