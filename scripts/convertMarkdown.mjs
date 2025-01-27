import fs from "fs-extra";
import path from "path";
import { marked } from "marked";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUTPUT_DIR = path.join(process.cwd(), "public/generated-content");

async function processDirectory(dir, relativePath = "") {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const outputRelativePath = path.join(relativePath, entry.name.replace(/\.md$/, ".html"));

    if (entry.isDirectory()) {
      // keep going down the directory
      await processDirectory(fullPath, path.join(relativePath, entry.name));
    } else if (entry.isFile() && path.extname(entry.name) === ".md") {
      const markdownContent = await fs.readFile(fullPath, "utf-8");
      const htmlContent = marked.parse(markdownContent);

      // Write the HTML file to the output directory
      const outputPath = path.join(OUTPUT_DIR, outputRelativePath);
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, htmlContent, "utf-8");

      console.log(`Generated: ${outputPath}`);
    }
  }
}

(async () => {
  try {
    await fs.ensureDir(OUTPUT_DIR);
    await processDirectory(CONTENT_DIR);
    console.log("All markdown files have been processed.");
  } catch (err) {
    console.error("Error processing markdown files:", err);
  }
})();
