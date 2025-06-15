import React from "react";
import styles from "./Confetti.module.css";

interface ConfettiProps {
  show: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className={styles.confettiContainer}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className={styles.confettiPiece}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
