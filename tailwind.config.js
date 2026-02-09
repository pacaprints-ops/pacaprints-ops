/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ppTeal: "#B8E0D2",
        ppPeach: "#F7D9C4",
        ppBg: "#FBF6F0",
        ppText: "#1F2937",
      },
      boxShadow: {
        pp: "0 10px 25px rgba(0,0,0,0.08)",
        ppSoft: "0 6px 18px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        pp: "16px",
      },
    },
  },
  plugins: [],
};

