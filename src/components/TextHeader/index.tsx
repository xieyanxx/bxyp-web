import styles from './index.less';
function TextHeader({ text }: { text: string }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.line}></div>
      <div className={styles.title}>{text}</div>
    </div>
  );
}

export default TextHeader;
