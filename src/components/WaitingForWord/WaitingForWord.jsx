import React from 'react';
import styles from './WaitingForWord.module.css';

const WaitingForWord = ({ drawerName }) => {
  return (
    <div className={styles.container}>
      <div className={styles.emoji}>🎨</div>
      <p className={styles.name}>{drawerName} is choosing a word...</p>
      <div className={styles.dots}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
      <p className={styles.sub}>Please wait</p>
    </div>
  );
};

export default WaitingForWord;
