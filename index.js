#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";

const projectName = process.argv[2] || "vite-react-tailwind-app";

console.log(`\n🚀 Creating Vite + React + Tailwind project: ${projectName}\n`);

try {
  // 1. Create Vite project
  execSync(`npm create vite@latest ${projectName} -- --template react`, { stdio: "inherit" });

  // 2. Navigate inside
  process.chdir(projectName);

  // 3. Install Tailwind & deps
  console.log("\n📦 Installing Tailwind CSS...");
  execSync("npm install -D tailwindcss postcss autoprefixer", { stdio: "inherit" });

  // 4. Init Tailwind
  execSync("npx tailwindcss init -p", { stdio: "inherit" });

  // 5. Update tailwind.config.js (ESM style)
  fs.writeFileSync("tailwind.config.js", `
    /** @type {import('tailwindcss').Config} */
    export default {
      content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
      theme: { extend: {} },
      plugins: [],
    }
  `);

  // 6. Add Tailwind imports to index.css
  fs.writeFileSync("src/index.css", `
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
  `);

  console.log("\n✅ Tailwind CSS is now installed & configured!");
  console.log(`👉 Next steps:`);
  console.log(`   cd ${projectName}`);
  console.log(`   npm install`);
  console.log(`   npm run dev`);
  console.log("\n🎉 Happy coding!\n");
} catch (error) {
  console.error("❌ Something went wrong:", error.message);
}
