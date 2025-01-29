import styles from "./styles.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 data-text="Hello World" className={styles.glitch}>
        Hello World
      </h1>
    </div>
  );
}
