import Link from "next/link";
import styles from "./styles.module.css";
import ThreeScene from "@/components/Scene";

export default function Home() {
  return (
    <div className={`${styles.container} p-2 h-[300vh]`}>
      <h1 data-text="Hello World" className={styles.glitch}>
        Hello World
      </h1>
      <Link href="/posts/index">Posts</Link>
      <ThreeScene />
    </div>
  );
}
