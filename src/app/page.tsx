import Link from "next/link";
import styles from "./styles.module.css";
import ThreeScene from "@/components/Scene";
import { experiences } from "@/components/Experiences";

export default function Home() {
  return (
    <div
      className={`${styles.container} min-h-[800vh] p-2  max-w-screen-lg mx-auto relative`}
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
        This is a static website generated by Next.js. It also generate blog
        posts from markdown files. The code is available at{" "}
        <a href="https://github.com/hcsum/blog" className="underline">
          GitHub
        </a>
        .
      </p>
      <h2
        data-text="Experience"
        className={`mb-6 mt-[2000px] ${styles.glitch}`}
      >
        Experience
      </h2>
      {experiences.map((experience) => (
        <div
          key={experience.startDate}
          className="mb-8 p-6 rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold text-gray-300">
              {experience.company}
            </h3>
            <span className="text-sm text-gray-300">
              {experience.startDate} - {experience.endDate || "Present"}
            </span>
          </div>
          <p className="text-lg text-white mb-3">{experience.title}</p>
        </div>
      ))}
      <h2 data-text="Projects" className={`mb-6 mt-[2000px] ${styles.glitch}`}>
        Projects
      </h2>
      <div className="bg-white text-black p-4">
        <h3>
          <a
            href="https://declutterspace.net"
            className="decoration-solid font-bold"
          >
            declutterspace.net
          </a>
        </h3>
        <p>
          I’ve always yearned for a minimalist lifestyle. I don’t want my home
          to be a storage space; instead, I want all my belongings to serve a
          purpose. I guess I have a bit of a compulsive tendency when it comes
          to my stuff. So, I created this app to help with decluttering and
          organizing items. It takes a deadline-based approach to getting rid of
          things. I use LLM for photo recognition, allowing users to quickly
          upload items in bulk for easier management. Also, it&apos;s a good
          exercise to try out the new and shiny Next.js 15 features.
        </p>
      </div>

      <ThreeScene />
      <div className="absolute bottom-0 left-0 w-full text-center text-lg text-white p-8">
        Stay in touch: sumtsui@gmail.com
      </div>
    </div>
  );
}
