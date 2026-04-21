import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10212b',
        mist: '#f2ede3',
        coral: '#c9694d',
        lagoon: '#0f7d82',
        gold: '#f3c46c',
      },
      boxShadow: {
        panel: '0 24px 60px rgba(16, 33, 43, 0.12)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Segoe UI"', 'sans-serif'],
        body: ['"IBM Plex Sans"', '"Segoe UI"', 'sans-serif'],
      },
      backgroundImage: {
        'mesh-wash': 'radial-gradient(circle at top left, rgba(201,105,77,0.18), transparent 32%), radial-gradient(circle at top right, rgba(15,125,130,0.16), transparent 28%), linear-gradient(135deg, #faf7f1 0%, #f0ece4 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
