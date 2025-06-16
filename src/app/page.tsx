"use client";

import { useState } from "react";
import { MiniCrossword } from "../components/MiniCrossword";
import Confetti from "../components/Confetti";
import styles from "./page.module.css";

export default function Day1Game3() {
  const [gameWon, setGameWon] = useState(false);

  const handleGameComplete = (time: number) => {
    setGameWon(true);
    console.log(`Won in ${time} seconds!`);

    // Auto-hide confetti after 5 seconds
    setTimeout(() => {
      setGameWon(false);
    }, 5000);
  };

  return (
    <div className={styles.pageContainer}>
      <MiniCrossword
        gameId="daily"
        title="Sams Mini"
        acrossClues={[
          {
            number: 1,
            text: "Recurring theme",
            answer: "MOTIF",
            cells: [
              [0, 0],
              [0, 1],
              [0, 2],
              [0, 3],
              [0, 4],
            ],
          },
          {
            number: 6,
            text: "The Little Mermaid",
            answer: "ARIEL",
            cells: [
              [1, 0],
              [1, 1],
              [1, 2],
              [1, 3],
              [1, 4],
            ],
          },
          {
            number: 7,
            text: "Brothers? ___ cats?",
            answer: "TEARY",
            cells: [
              [2, 0],
              [2, 1],
              [2, 2],
              [2, 3],
              [2, 4],
            ],
          },
          {
            number: 8,
            text: "Scandinavian name meaning stern (u can search this up lol)",
            answer: "SOREN",
            cells: [
              [3, 0],
              [3, 1],
              [3, 2],
              [3, 3],
              [3, 4],
            ],
          },
          {
            number: 9,
            text: "Greatest sprinter of all time",
            answer: "USAIN",
            cells: [
              [4, 0],
              [4, 1],
              [4, 2],
              [4, 3],
              [4, 4],
            ],
          },
        ]}
        downClues={[
          {
            number: 1,
            text: "meaning `to wait` in Japanese",
            answer: "MATSU",
            cells: [
              [0, 0],
              [1, 0],
              [2, 0],
              [3, 0],
              [4, 0],
            ],
          },
          {
            number: 2,
            text: "Black and white sandwich cookies",
            answer: "OREOS",
            cells: [
              [0, 1],
              [1, 1],
              [2, 1],
              [3, 1],
              [4, 1],
            ],
          },
          {
            number: 3,
            text: "Head ornament adorned with jewels",
            answer: "TIARA",
            cells: [
              [0, 2],
              [1, 2],
              [2, 2],
              [3, 2],
              [4, 2],
            ],
          },
          {
            number: 4,
            text: "Innovation experts Real estate Institute (acronym… I couldn't tind any other word hahaha",
            answer: "IEREI",
            cells: [
              [0, 3],
              [1, 3],
              [2, 3],
              [3, 3],
              [4, 3],
            ],
          },
          {
            number: 5,
            text: "Disney prince with `pubes on his chin` (your words, not mine... 💀)",
            answer: "FLYNN",
            cells: [
              [0, 4],
              [1, 4],
              [2, 4],
              [3, 4],
              [4, 4],
            ],
          },
        ]}
        onComplete={handleGameComplete}
      />

      <Confetti show={gameWon} />
    </div>
  );
}
