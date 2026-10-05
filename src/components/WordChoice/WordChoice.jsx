import React, { useState, useEffect, useRef } from 'react';
import styles from './WordChoice.module.css';

const CHOOSE_SECONDS = 15;

const WordChoice = ({ words, onSelect }) => {
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(CHOOSE_SECONDS);
  const selectedRef = useRef(false);

  const handleSelect = (word) => {
    if (selectedRef.current) return;
    selectedRef.current = true;
    setSelected(word);
    onSelect(word);
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!selectedRef.current && words.length > 0) {
        handleSelect(words[0]);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const pct = (timeLeft / CHOOSE_SECONDS) * 100;
  const urgent = timeLeft <= 5;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.emoji}>🎨</div>
        <h2 className={styles.title}>Choose a word to draw</h2>
        <p className={styles.subtitle}>Pick one — others won't see your choice</p>

        <div className={styles.timerRow}>
          <span className={`${styles.timerNum} ${urgent ? styles.timerUrgent : ''}`}>{timeLeft}s</span>
          <div className={styles.timerTrack}>
            <div
              className={`${styles.timerBar} ${urgent ? styles.timerBarUrgent : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className={styles.wordList}>
          {words.map((word) => (
            <button
              key={word}
              className={`${styles.wordBtn} ${selected === word ? styles.wordBtnSelected : ''} ${selected && selected !== word ? styles.wordBtnDisabled : ''}`}
              onClick={() => handleSelect(word)}
              disabled={!!selected}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordChoice;
