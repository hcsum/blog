import Link from "next/link";
import styles from "./styles.module.css";
import ThreeScene from "@/components/Scene";

export default function Home() {
  return (
    <div
      className={`${styles.container} p-2 h-[500vh] max-w-screen-lg mx-auto relative`}
    >
      <div className="flex justify-between items-center gap-8 mb-8">
        <h1 data-text="Hello World" className={styles.glitch}>
          Hello World
        </h1>
        <Link href="/posts/index" className="font-bold text-xl">
          Posts
        </Link>
      </div>
      <p>Welcome! My name is Haochen Xu.</p>
      <p>
        Over my career, I mainly worked full-stack in the web and JavaScript
        ecosystem.
      </p>
      <p>
        Recently I&apos;m interested in Three.js and cool CSS effects. This page
        is me exprimenting and having fun with it.
      </p>
      <p>
        This is a fully static website generated by Next.js. It also generate
        blog posts from markdown files. The code is available at{" "}
        <a href="https://github.com/hcsum/blog" className="underline">
          GitHub
        </a>
        .
      </p>

      <ThreeScene />
      <div className="absolute bottom-0 left-0 w-full text-center text-lg text-white p-8">
        Stay in touch: sumtsui@gmail.com
      </div>
    </div>
  );
}
