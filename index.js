#!/usr/bin/env node

import { execSync } from "child_process";
import path from "path";
import fs from "fs";

// Helper to run shell commands
const run = (cmd, cwd = process.cwd()) => {
  console.log(`\n📦 Running: ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd });
};

// Get project name from CLI argument
const projectName = process.argv[2];
if (!projectName) {
  console.error(
    "❌ Please provide a project name. Example: npx create-react-tailwind my-app"
  );
  process.exit(1);
}

(async () => {
  try {
    // 1. Create Vite + React project
    run(`npm create vite@latest ${projectName} -- --template react`);
    const projectPath = path.join(process.cwd(), projectName);

    // 2. Install Tailwind CSS
    run(`npm install tailwindcss @tailwindcss/vite`, projectPath);

    // Tailwind config in vite.config.js
    const viteConfigPath = path.join(projectPath, "vite.config.js");
    let viteConfig = fs.readFileSync(viteConfigPath, "utf-8");
    viteConfig = `import tailwindcss from '@tailwindcss/vite'\n` + viteConfig;
    viteConfig = viteConfig.replace(/plugins:\s*\[/, "plugins: [\n    tailwindcss(),");
    fs.writeFileSync(viteConfigPath, viteConfig);

    // index.css
    fs.writeFileSync(path.join(projectPath, "src", "index.css"), `@import "tailwindcss";\n`);

    // main.jsx or main.tsx import fix
    const mainFile = fs.existsSync(path.join(projectPath, "src/main.jsx"))
      ? "src/main.jsx"
      : "src/main.tsx";
    const mainPath = path.join(projectPath, mainFile);
    let mainContent = fs.readFileSync(mainPath, "utf-8");
    mainContent = mainContent.replace(/import\s+['"]\.\/index\.css['"];?/g, "");
    mainContent = `import './index.css';\n` + mainContent;
    fs.writeFileSync(mainPath, mainContent);

    // 3. Install Axios + React Router
    run(`npm install axios react-router-dom`, projectPath);

    // 4. Axios setup
    const utilsPath = path.join(projectPath, "src", "utils");
    if (!fs.existsSync(utilsPath)) fs.mkdirSync(utilsPath, { recursive: true });

    const axiosContent = `import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    headers: { "Content-Type": "application/json" },
    timeout: 10000
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = \`Bearer \${token}\`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
);
`;
    fs.writeFileSync(path.join(utilsPath, "axiosInstance.js"), axiosContent);

    // 5. Create default folder structure
    const folders = ["components", "pages", "hooks", "store", "assets"];
    folders.forEach(folder => fs.mkdirSync(path.join(projectPath, "src", folder), { recursive: true }));

    // 6. Replace App.jsx content
    const appFile = fs.existsSync(path.join(projectPath, "src/App.jsx"))
      ? path.join(projectPath, "src/App.jsx")
      : path.join(projectPath, "src/App.tsx");

    const appContent = `export default function App() {
  return (
    <div className="flex flex-col justify-center items-center h-screen font-sans bg-gray-100 text-gray-900 text-center">
      <h1 className="text-4xl font-bold mb-2">
        Welcome to <span className="text-blue-600">${projectName}</span> 🚀
      </h1>
      <p className="text-lg text-gray-600">Your project is ready. Start building amazing things!</p>
    </div>
  );
}`;
    fs.writeFileSync(appFile, appContent);

    // 7. Setup React Router in main.jsx
    const routerSetup = `import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);`;

    fs.writeFileSync(mainPath, routerSetup);

    console.log("\n✅ React + Tailwind + Axios setup complete!");
    console.log(`\nNext steps:\n  cd ${projectName}\n  npm run dev`);
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
