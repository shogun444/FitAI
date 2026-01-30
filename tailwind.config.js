/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind uses the content field to scan for Tailwind classes
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Custom font families
      fontFamily: {
        primary: ["Manrope-Regular"],
        primaryMedium: ["Manrope-Medium"],
        primarySemiBold: ["Manrope-SemiBold"],
        primaryBold: ["Manrope-Bold"],
        secondary: ["Inter-Regular"],
        secondaryMedium: ["Inter-Medium"],
        secondarySemiBold: ["Inter-SemiBold"],
      },
      // Fintech design tokens
      colors: {
        primary: {
          DEFAULT: "#c9f158",
          50: "#f7fee7",
          100: "#ecfccb",
          200: "#d9f99d",
          300: "#c9f158",
          400: "#a3e635",
          500: "#84cc16",
          600: "#65a30d",
          700: "#4d7c0f",
          800: "#3f6212",
          900: "#365314",
        },
        background: {
          light: "#ffffff",
          dark: "#020202",
        },
        surface: {
          DEFAULT: "#f2f3f5",
          dark: "#1a1a1a",
        },
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
