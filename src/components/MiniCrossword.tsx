"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./MiniCrossword.module.css";

interface Cell {
  row: number;
  col: number;
  letter: string;
  clueNumber?: number;
  isAcross: boolean;
  isDown: boolean;
  isRevealed: boolean;
  isCorrect: boolean;
  isFilled: boolean;
  userInput: string;
}

interface Clue {
  number: number;
  text: string;
  answer: string;
  cells: [number, number][];
}

export interface CrosswordProps {
  gameId: string;
  size?: number;
  title?: string;
  author?: string;
  difficulty?: "easy" | "medium" | "hard";
  date?: string;
  acrossClues: Clue[];
  downClues: Clue[];
  onComplete?: (time: number) => void;
  revealedLetters?: [number, number, string][];
  theme?: {
    backgroundColor?: string;
    cellBackgroundColor?: string;
    cellSelectedColor?: string;
    cellHighlightedColor?: string;
    cellRevealedColor?: string;
    cellCorrectColor?: string;
    textColor?: string;
    clueSelectedColor?: string;
  };
}

// NYT mini constants colours
const defaultTheme = {
  backgroundColor: "#ffffff",
  cellBackgroundColor: "#ffffff",
  cellSelectedColor: "#a7d8ff",
  cellHighlightedColor: "#FCDA00",
  cellRevealedColor: "#ffeda3",
  cellCorrectColor: "#dfffdf",
  textColor: "#000000",
  clueSelectedColor: "#e6f2ff",
};

export const MiniCrossword: React.FC<CrosswordProps> = ({
  gameId,
  size = 5,
  author,
  title = "Mini Crossword",
  acrossClues,
  downClues,
  onComplete,
  revealedLetters = [],
  theme = defaultTheme,
}) => {
  const mergedTheme = { ...defaultTheme, ...theme };

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [selectedClue, setSelectedClue] = useState<number | null>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeGrid();
    loadGameState();

    if (!startTime) {
      setStartTime(Date.now());
      startTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      if (!isPaused && !isCompleted) {
        setElapsedTime((prev) => prev + 1);
      }
    }, 1000);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const shareCurrentClue = async () => {
    if (!selectedClue) {
      alert("No clue selected. Please select a clue to share.");
      return;
    }

    const clueText = getClueText(selectedClue, direction);
    const clueTitle = `${direction.toUpperCase()} ${selectedClue}`;
    const shareMessage = `hey ${author}, I'm stuck on your crossword 😓 could I get a hint for ${clueTitle}: ${clueText}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Crossword Clue: ${clueTitle}`,
          text: shareMessage,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareMessage);
        alert("Clue copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Could not share the clue");
    }
  };

  const initializeGrid = () => {
    const newGrid: Cell[][] = Array(size)
      .fill(null)
      .map((_, r) =>
        Array(size)
          .fill(null)
          .map((_, c) => ({
            row: r,
            col: c,
            letter: "",
            isAcross: false,
            isDown: false,
            isRevealed: false,
            isCorrect: false,
            isFilled: false,
            userInput: "",
          }))
      );

    for (const clue of acrossClues) {
      for (const [row, col] of clue.cells) {
        newGrid[row][col].isAcross = true;
        newGrid[row][col].isFilled = true;

        if (row === clue.cells[0][0] && col === clue.cells[0][1]) {
          newGrid[row][col].clueNumber = clue.number;
        }
      }
    }

    for (const clue of downClues) {
      for (const [row, col] of clue.cells) {
        newGrid[row][col].isDown = true;
        newGrid[row][col].isFilled = true;

        if (row === clue.cells[0][0] && col === clue.cells[0][1]) {
          if (!newGrid[row][col].clueNumber) {
            newGrid[row][col].clueNumber = clue.number;
          }
        }
      }
    }

    for (const [row, col, letter] of revealedLetters) {
      if (row >= 0 && row < size && col >= 0 && col < size) {
        newGrid[row][col].isRevealed = true;
        newGrid[row][col].letter = letter;
        newGrid[row][col].userInput = letter;
      }
    }

    setGrid(newGrid);

    let initialRow = 0;
    let initialCol = 0;

    outerLoop: for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (newGrid[r][c].isFilled) {
          initialRow = r;
          initialCol = c;
          break outerLoop;
        }
      }
    }

    setSelectedCell({ row: initialRow, col: initialCol });
    setSelectedClue(
      getClueNumberFromCell(initialRow, initialCol, newGrid, "across")
    );
  };

  // Load saved game state from localStorage
  const loadGameState = () => {
    try {
      const savedGame = localStorage.getItem(`crossword_${gameId}`);
      if (savedGame) {
        const gameData = JSON.parse(savedGame);

        // Update grid with saved state
        setGrid(gameData.grid);
        setStartTime(gameData.startTime);
        setElapsedTime(gameData.elapsedTime);
        setIsCompleted(gameData.isCompleted);

        if (gameData.isCompleted) {
          pauseTimer();
        }
      }
    } catch (error) {
      console.error("Error loading game state:", error);
    }
  };

  // Save game state to localStorage
  const saveGameState = useCallback(() => {
    try {
      const gameData = {
        grid,
        startTime,
        elapsedTime,
        isCompleted,
        lastUpdated: Date.now(),
      };

      localStorage.setItem(`crossword_${gameId}`, JSON.stringify(gameData));
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  }, [grid, startTime, elapsedTime, isCompleted, gameId]);

  useEffect(() => {
    if (grid.length > 0) {
      saveGameState();
      checkCompletion();
    }
  }, [grid, saveGameState]);

  const checkCompletion = () => {
    if (grid.length === 0) return;

    let isCorrect = true;

    for (const clue of acrossClues) {
      let clueAnswer = "";
      for (const [row, col] of clue.cells) {
        clueAnswer += grid[row][col].userInput.toUpperCase();
      }

      if (clueAnswer !== clue.answer.toUpperCase()) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      for (const clue of downClues) {
        let clueAnswer = "";
        for (const [row, col] of clue.cells) {
          clueAnswer += grid[row][col].userInput.toUpperCase();
        }

        if (clueAnswer !== clue.answer.toUpperCase()) {
          isCorrect = false;
          break;
        }
      }
    }

    // If completed, update state and trigger callback
    if (isCorrect && !isCompleted) {
      setIsCompleted(true);

      if (onComplete) {
        onComplete(elapsedTime);
      }

      alert(
        `Congratulations! You completed the puzzle in ${formatTime(
          elapsedTime
        )}!`
      );

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const getClueNumberFromCell = (
    row: number,
    col: number,
    gridData: Cell[][],
    dir: "across" | "down"
  ): number | null => {
    if (!gridData[row][col]) return null;

    const isAcross = gridData[row][col].isAcross;
    const isDown = gridData[row][col].isDown;

    if (dir === "across" && isAcross) {
      let c = col;
      while (c > 0 && gridData[row][c - 1].isAcross) {
        c--;
      }

      return gridData[row][c].clueNumber || null;
    } else if (dir === "down" && isDown) {
      let r = row;
      while (r > 0 && gridData[r - 1][col].isDown) {
        r--;
      }

      return gridData[r][col].clueNumber || null;
    }

    return null;
  };

  const getClueText = (
    clueNumber: number | null,
    dir: "across" | "down"
  ): string => {
    if (!clueNumber) return "";

    const clues = dir === "across" ? acrossClues : downClues;
    const clue = clues.find((c) => c.number === clueNumber);

    return clue ? clue.text : "";
  };

  const handleCellPress = (row: number, col: number) => {
    if (!grid[row][col].isFilled) return;

    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      const newDirection = direction === "across" ? "down" : "across";
      setDirection(newDirection);

      const newClue = getClueNumberFromCell(row, col, grid, newDirection);
      setSelectedClue(newClue);
    } else {
      setSelectedCell({ row, col });

      const canGoAcross = grid[row][col].isAcross;
      const canGoDown = grid[row][col].isDown;

      if (canGoAcross && (!canGoDown || direction === "across")) {
        setDirection("across");
        const newClue = getClueNumberFromCell(row, col, grid, "across");
        setSelectedClue(newClue);
      } else if (canGoDown) {
        setDirection("down");
        const newClue = getClueNumberFromCell(row, col, grid, "down");
        setSelectedClue(newClue);
      }
    }
  };

  const handleClueTextPress = () => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const canGoAcross = grid[row][col].isAcross;
    const canGoDown = grid[row][col].isDown;

    if (canGoAcross && canGoDown) {
      const newDirection = direction === "across" ? "down" : "across";
      setDirection(newDirection);
      const newClue = getClueNumberFromCell(row, col, grid, newDirection);
      setSelectedClue(newClue);
    }
  };

  const handleKeyPress = useCallback(
    (key: string) => {
      if (isCompleted || !selectedCell) return;

      const { row, col } = selectedCell;
      const newGrid = [...grid];

      if (/^[A-Za-z]$/.test(key)) {
        newGrid[row][col].userInput = key.toUpperCase();
        newGrid[row][col].isFilled = true;

        moveToNextCell(row, col);
      } else if (key === "Backspace" || key === "Delete") {
        if (newGrid[row][col].userInput !== "") {
          newGrid[row][col].userInput = "";
        } else {
          moveToPrevCell(row, col);
        }
      }

      setGrid(newGrid);
    },
    [isCompleted, selectedCell, grid]
  );

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      handleKeyPress(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  const moveToNextCell = (row: number, col: number) => {
    if (direction === "across") {
      let nextCol = col + 1;
      while (nextCol < size) {
        if (grid[row][nextCol].isFilled) {
          handleCellPress(row, nextCol);
          return;
        }
        nextCol++;
      }

      const acrossClue = acrossClues.find((clue) =>
        clue.cells.some(([r, c]) => r === row && c === col)
      );

      if (acrossClue) {
        const currentIndex = acrossClue.cells.findIndex(
          ([r, c]) => r === row && c === col
        );
        if (currentIndex !== -1 && currentIndex < acrossClue.cells.length - 1) {
          const [nextRow, nextCol] = acrossClue.cells[currentIndex + 1];
          handleCellPress(nextRow, nextCol);
        }
      }
    } else {
      let nextRow = row + 1;
      while (nextRow < size) {
        if (grid[nextRow][col].isFilled) {
          handleCellPress(nextRow, col);
          return;
        }
        nextRow++;
      }

      const downClue = downClues.find((clue) =>
        clue.cells.some(([r, c]) => r === row && c === col)
      );

      if (downClue) {
        const currentIndex = downClue.cells.findIndex(
          ([r, c]) => r === row && c === col
        );
        if (currentIndex !== -1 && currentIndex < downClue.cells.length - 1) {
          const [nextRow, nextCol] = downClue.cells[currentIndex + 1];
          handleCellPress(nextRow, nextCol);
        }
      }
    }
  };

  const moveToPrevCell = (row: number, col: number) => {
    if (direction === "across") {
      let prevCol = col - 1;
      while (prevCol >= 0) {
        if (grid[row][prevCol].isFilled) {
          handleCellPress(row, prevCol);
          return;
        }
        prevCol--;
      }
    } else {
      let prevRow = row - 1;
      while (prevRow >= 0) {
        if (grid[prevRow][col].isFilled) {
          handleCellPress(prevRow, col);
          return;
        }
        prevRow--;
      }
    }
  };

  const goToNextClue = () => {
    if (!selectedClue) return;

    const currentClues = direction === "across" ? acrossClues : downClues;
    const currentIndex = currentClues.findIndex(
      (clue) => clue.number === selectedClue
    );

    if (currentIndex !== -1 && currentIndex < currentClues.length - 1) {
      // Go to next clue in the same direction
      const nextClue = currentClues[currentIndex + 1];
      setSelectedClue(nextClue.number);

      // Select the first cell of the clue
      const [nextRow, nextCol] = nextClue.cells[0];
      setSelectedCell({ row: nextRow, col: nextCol });
    } else if (currentIndex === currentClues.length - 1) {
      // If at the end of current direction clues, go to first clue of the other direction
      const newDirection = direction === "across" ? "down" : "across";
      const newClues = newDirection === "across" ? acrossClues : downClues;

      if (newClues.length > 0) {
        setDirection(newDirection);
        setSelectedClue(newClues[0].number);

        // Select the first cell of the first clue in the new direction
        const [nextRow, nextCol] = newClues[0].cells[0];
        setSelectedCell({ row: nextRow, col: nextCol });
      }
    }
  };

  // Navigate to the previous clue
  const goToPrevClue = () => {
    if (!selectedClue) return;

    const currentClues = direction === "across" ? acrossClues : downClues;
    const currentIndex = currentClues.findIndex(
      (clue) => clue.number === selectedClue
    );

    if (currentIndex > 0) {
      // Go to previous clue in the same direction
      const prevClue = currentClues[currentIndex - 1];
      setSelectedClue(prevClue.number);

      // Select the first cell of the clue
      const [prevRow, prevCol] = prevClue.cells[0];
      setSelectedCell({ row: prevRow, col: prevCol });
    } else if (currentIndex === 0) {
      // If at the beginning of current direction clues, go to last clue of the other direction
      const newDirection = direction === "across" ? "down" : "across";
      const newClues = newDirection === "across" ? acrossClues : downClues;

      if (newClues.length > 0) {
        setDirection(newDirection);
        const lastClue = newClues[newClues.length - 1];
        setSelectedClue(lastClue.number);

        // Select the first cell of the last clue in the new direction
        const [prevRow, prevCol] = lastClue.cells[0];
        setSelectedCell({ row: prevRow, col: prevCol });
      }
    }
  };

  // Handle check/reveal operations
  const handleCheckCell = () => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const currentClue =
      direction === "across"
        ? acrossClues.find((clue) => clue.number === selectedClue)
        : downClues.find((clue) => clue.number === selectedClue);

    if (!currentClue) return;

    // Find the index of the current cell in the clue
    const cellIndex = currentClue.cells.findIndex(
      ([r, c]) => r === row && c === col
    );

    if (cellIndex !== -1) {
      const correctLetter = currentClue.answer[cellIndex];
      const userInput = grid[row][col].userInput;

      if (userInput.toUpperCase() === correctLetter.toUpperCase()) {
        const newGrid = [...grid];
        newGrid[row][col].isCorrect = true;
        setGrid(newGrid);
      } else {
        // Incorrect - show alert
        alert("This letter is not correct.");
      }
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Render single cell in the grid
  const renderCell = (cell: Cell, rowIndex: number, colIndex: number) => {
    const isSelected =
      selectedCell &&
      selectedCell.row === rowIndex &&
      selectedCell.col === colIndex;

    const isHighlighted =
      selectedCell &&
      selectedClue &&
      ((direction === "across" &&
        rowIndex === selectedCell.row &&
        getClueNumberFromCell(rowIndex, colIndex, grid, "across") ===
          selectedClue) ||
        (direction === "down" &&
          colIndex === selectedCell.col &&
          getClueNumberFromCell(rowIndex, colIndex, grid, "down") ===
            selectedClue));

    // If cell is not filled (not part of any clue), render it as black
    if (!cell.isFilled) {
      return (
        <div
          key={`cell-${rowIndex}-${colIndex}`}
          className={styles.cellBlack}
        />
      );
    }

    // Build class names for cell state
    const cellClasses = [styles.cell];

    if (isSelected) {
      cellClasses.push(styles.cellSelected);
    } else if (isHighlighted) {
      cellClasses.push(styles.cellHighlighted);
    } else if (cell.isRevealed) {
      cellClasses.push(styles.cellRevealed);
    } else if (cell.isCorrect) {
      cellClasses.push(styles.cellCorrect);
    }

    return (
      <div
        key={`cell-${rowIndex}-${colIndex}`}
        className={cellClasses.join(" ")}
        onClick={() => handleCellPress(rowIndex, colIndex)}
      >
        {cell.clueNumber && (
          <span className={styles.clueNumber}>{cell.clueNumber}</span>
        )}
        <span className={styles.cellInput}>{cell.userInput}</span>
      </div>
    );
  };

  const renderKeyboard = () => {
    const letters = [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m"],
    ];

    return (
      <div className={styles.keyboard}>
        {/* Top keyboard row */}
        <div className={styles.keyboardRow}>
          {letters[0].map((letter) => (
            <button
              key={`key-${letter}`}
              className={styles.letterTile}
              onClick={() => handleKeyPress(letter)}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Middle keyboard row */}
        <div className={styles.keyboardRow}>
          {letters[1].map((letter) => (
            <button
              key={`key-${letter}`}
              className={styles.letterTile}
              onClick={() => handleKeyPress(letter)}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Bottom keyboard row */}
        <div className={styles.keyboardRow}>
          <button className={styles.specialKey}>More</button>

          {letters[2].map((letter) => (
            <button
              key={`key-${letter}`}
              className={styles.letterTile}
              onClick={() => handleKeyPress(letter)}
            >
              {letter}
            </button>
          ))}

          <button
            className={styles.specialKey}
            onClick={() => handleKeyPress("Backspace")}
          >
            ⌫
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={styles.crosswordContainer}
      style={{ backgroundColor: mergedTheme.backgroundColor }}
    >
      {/* Header with timer, title, and controls */}
      <div className={styles.header}>
        <span className={styles.timer}>{formatTime(elapsedTime)}</span>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.headerButtons}>
          <button onClick={handleCheckCell} className={styles.headerButton}>
            ✓
          </button>
          <button onClick={shareCurrentClue} className={styles.headerButton}>
            💬
          </button>
        </div>
      </div>

      {/* Game grid */}
      <div className={styles.gridOutline}>
        <div className={styles.gridContainer}>
          {grid.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className={styles.row}>
              {row.map((cell, colIndex) =>
                renderCell(cell, rowIndex, colIndex)
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section with clue bar and keyboard */}
      <div className={styles.bottomContainer}>
        {/* Clue bar */}
        <div className={styles.clueBar}>
          <button className={styles.clueNavButton} onClick={goToPrevClue}>
            ←
          </button>

          <div
            className={styles.clueTextContainer}
            onClick={handleClueTextPress}
          >
            <span className={styles.clueText}>
              {selectedClue
                ? `${direction.toUpperCase()} ${selectedClue}: ${getClueText(
                    selectedClue,
                    direction
                  )}`
                : ""}
            </span>
          </div>

          <button className={styles.clueNavButton} onClick={goToNextClue}>
            →
          </button>
        </div>

        {renderKeyboard()}
      </div>
    </div>
  );
};
