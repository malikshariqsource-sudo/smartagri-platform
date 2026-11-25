import type { Config } from "tailwindcss";
export default { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { forest: "#183c2d", leaf: "#527a43", lime: "#c8e17b", cream: "#f7f8f3" }, boxShadow: { soft: "0 12px 40px rgba(23,54,39,.07)" } } }, plugins: [] } satisfies Config;
