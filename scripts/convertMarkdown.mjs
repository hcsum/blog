import fs from "fs-extra";
import path from "path";
import { marked } from "marked";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUTPUT_DIR = path.join(process.cwd(), "public/generated-content");

async function processDirectory(dir, relativePath = "") {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const outputRelativePath = path.join(
      relativePath,
      entry.name.replace(/\.md$/, ".html"),
    );

    if (entry.isDirectory()) {
      await processDirectory(fullPath, path.join(relativePath, entry.name));
    } else if (entry.isFile() && path.extname(entry.name) === ".md") {
      const markdownContent = await fs.readFile(fullPath, "utf-8");

      const htmlContent = marked.parse(markdownContent);

      const outputPath = path.join(OUTPUT_DIR, outputRelativePath);
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, htmlContent, "utf-8");

      console.log(`Generated: ${outputPath}`);
    }
  }
}

async function cleanupOutputDirectory(
  contentDir,
  outputDir,
  relativePath = "",
) {
  const outputEntries = await fs.readdir(path.join(outputDir, relativePath), {
    withFileTypes: true,
  });

  for (const entry of outputEntries) {
    const outputFullPath = path.join(outputDir, relativePath, entry.name);
    const contentFullPath = path.join(
      contentDir,
      relativePath,
      entry.isDirectory() ? entry.name : entry.name.replace(/\.html$/, ".md"),
    );

    if (entry.isDirectory()) {
      // Recursively check subdirectories
      await cleanupOutputDirectory(
        contentDir,
        outputDir,
        path.join(relativePath, entry.name),
      );

      // Remove directory if empty
      const remainingFiles = await fs.readdir(outputFullPath);
      if (remainingFiles.length === 0) {
        await fs.remove(outputFullPath);
        console.log(`Removed empty directory: ${outputFullPath}`);
      }
    } else if (entry.isFile()) {
      // Remove HTML file if corresponding MD file doesn't exist
      if (!(await fs.pathExists(contentFullPath))) {
        await fs.remove(outputFullPath);
        console.log(`Removed orphaned file: ${outputFullPath}`);
      }
    }
  }
}

(async () => {
  try {
    await fs.ensureDir(OUTPUT_DIR);
    await processDirectory(CONTENT_DIR);
    await cleanupOutputDirectory(CONTENT_DIR, OUTPUT_DIR);
    console.log(
      "All markdown files have been processed and cleanup completed.",
    );
  } catch (err) {
    console.error("Error processing markdown files:", err);
  }
})();
