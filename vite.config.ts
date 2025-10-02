import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ }) => ({
    server: {
        host: true,
        port: 5173,
        strictPort: true,
        watch: { usePolling: true },
        hmr: {
            clientPort: 5173,
        },
    },
    preview: { port: 4173 },
    build: {
        outDir: "dist/",
    },
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
