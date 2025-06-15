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
        gameId="day1game3"
        title="Harlen's Mini"
        acrossClues={[
          {
            number: 1,
            text: "Doomscrolling",
            answer: "REELS",
            cells: [
              [0, 0],
              [0, 1],
              [0, 2],
              [0, 3],
              [0, 4],
            ],
          },
          {
            number: 5,
            text: "Songs from Mamma Mia",
            answer: "ABBA",
            cells: [
              [1, 0],
              [1, 1],
              [1, 2],
              [1, 3],
            ],
          },
          {
            number: 6,
            text: "Mushroom Kingdom Residents",
            answer: "TOADS",
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
            text: " Milk Alternative Ingredient",
            answer: "SOY",
            cells: [
              [3, 0],
              [3, 1],
              [3, 2],
            ],
          },
          {
            number: 9,
            text: "Santa Likes them?",
            answer: "HO",
            cells: [
              [4, 3],
              [4, 4],
            ],
          },
        ]}
        downClues={[
          {
            number: 1,
            text: "Mascot Squatter",
            answer: "RATS",
            cells: [
              [0, 0],
              [1, 0],
              [2, 0],
              [3, 0],
            ],
          },
          {
            number: 2,
            text: "Kindling material?",
            answer: "EBOOK",
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
            text: "A Place to find GIRLS",
            answer: "EBAY",
            cells: [
              [0, 2],
              [1, 2],
              [2, 2],
              [3, 2],
            ],
          },
          {
            number: 4,
            text: "A mate or buddy",
            answer: "LAD",
            cells: [
              [0, 3],
              [1, 3],
              [2, 3],
            ],
          },
          {
            number: 7,
            text: "Salty Cracker",
            answer: "SAO",
            cells: [
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
