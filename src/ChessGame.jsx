import React, { useState, useEffect } from "react";
import { Timer, X } from "lucide-react";

// Custom Alert Component
const Alert = ({ children, onClose }) => (
  <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
    <span className="block sm:inline">{children}</span>
    {onClose && (
      <span
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </span>
    )}
  </div>
);

// Initial board setup
const initialBoard = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  Array(8).fill(""),
  Array(8).fill(""),
  Array(8).fill(""),
  Array(8).fill(""),
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];

const ChessGame = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [moveList, setMoveList] = useState([]);
  const [gameStatus, setGameStatus] = useState("active"); // 'active', 'check', 'checkmate'
  const [notification, setNotification] = useState(null);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Convert position to chess notation
  const toChessNotation = (row, col) => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
    return files[col] + ranks[row];
  };

  // Find king position
  const findKing = (isWhite, currentBoard) => {
    const kingPiece = isWhite ? "K" : "k";
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (currentBoard[i][j] === kingPiece) {
          return [i, j];
        }
      }
    }
    return null;
  };

  // Check if a square is under attack
  const isSquareUnderAttack = (row, col, isWhiteKing, currentBoard) => {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = currentBoard[i][j];
        if (piece === "") continue;
        const isPieceWhite = piece === piece.toUpperCase();
        if (isPieceWhite === isWhiteKing) continue;

        if (isLegalMove(i, j, row, col, currentBoard, true)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check if the king is in check
  const isInCheck = (isWhite, currentBoard) => {
    const kingPos = findKing(isWhite, currentBoard);
    if (!kingPos) return false;
    return isSquareUnderAttack(kingPos[0], kingPos[1], isWhite, currentBoard);
  };

  // Simulate move to check if it prevents check
  const doesMovePreventCheck = (startRow, startCol, endRow, endCol) => {
    const newBoard = board.map((row) => [...row]);
    newBoard[endRow][endCol] = newBoard[startRow][startCol];
    newBoard[startRow][startCol] = "";
    return !isInCheck(isWhiteTurn, newBoard);
  };

  // Timer effect
  useEffect(() => {
    if (gameStatus === "checkmate") return;

    const timer = setInterval(() => {
      if (isWhiteTurn) {
        setWhiteTime((prev) => {
          if (prev <= 0) {
            setGameStatus("checkmate");
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 0) {
            setGameStatus("checkmate");
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isWhiteTurn, gameStatus]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Check if a move is legal
  const isLegalMove = (
    startRow,
    startCol,
    endRow,
    endCol,
    currentBoard = board,
    ignoreCheck = false
  ) => {
    const piece = currentBoard[startRow][startCol];
    const isWhitePiece = piece === piece.toUpperCase();

    if (endRow < 0 || endRow > 7 || endCol < 0 || endCol > 7) {
      !ignoreCheck && setNotification("Invalid move: Outside the board");
      return false;
    }

    if (
      currentBoard[endRow][endCol] !== "" &&
      isWhitePiece === currentBoard[endRow][endCol].toUpperCase()
    ) {
      !ignoreCheck &&
        setNotification("Invalid move: Cannot capture your own piece");
      return false;
    }

    const pieceType = piece.toLowerCase();
    let isValidMove = false;

    switch (pieceType) {
      case "p": // Pawn
        if (isWhitePiece) {
          const isFirstMove = startRow === 6;
          const normalMove =
            startRow - 1 === endRow &&
            startCol === endCol &&
            currentBoard[endRow][endCol] === "";
          const doubleMove =
            isFirstMove &&
            startRow - 2 === endRow &&
            startCol === endCol &&
            currentBoard[endRow][endCol] === "" &&
            currentBoard[startRow - 1][endCol] === "";
          const captureMove =
            startRow - 1 === endRow &&
            Math.abs(startCol - endCol) === 1 &&
            currentBoard[endRow][endCol] !== "" &&
            currentBoard[endRow][endCol] ===
              currentBoard[endRow][endCol].toLowerCase();

          isValidMove = normalMove || doubleMove || captureMove;
          if (!isValidMove && !ignoreCheck) {
            setNotification("Invalid pawn move");
          }
        } else {
          const isFirstMove = startRow === 1;
          const normalMove =
            startRow + 1 === endRow &&
            startCol === endCol &&
            currentBoard[endRow][endCol] === "";
          const doubleMove =
            isFirstMove &&
            startRow + 2 === endRow &&
            startCol === endCol &&
            currentBoard[endRow][endCol] === "" &&
            currentBoard[startRow + 1][endCol] === "";
          const captureMove =
            startRow + 1 === endRow &&
            Math.abs(startCol - endCol) === 1 &&
            currentBoard[endRow][endCol] !== "" &&
            currentBoard[endRow][endCol] ===
              currentBoard[endRow][endCol].toUpperCase();

          isValidMove = normalMove || doubleMove || captureMove;
          if (!isValidMove && !ignoreCheck) {
            setNotification("Invalid pawn move");
          }
        }
        break;

      case "r": // Rook
        if (startRow === endRow || startCol === endCol) {
          const rowDir =
            startRow === endRow
              ? 0
              : (endRow - startRow) / Math.abs(endRow - startRow);
          const colDir =
            startCol === endCol
              ? 0
              : (endCol - startCol) / Math.abs(endCol - startCol);
          let row = startRow + rowDir;
          let col = startCol + colDir;

          isValidMove = true;
          while (row !== endRow || col !== endCol) {
            if (currentBoard[row][col] !== "") {
              isValidMove = false;
              break;
            }
            row += rowDir;
            col += colDir;
          }
        }
        if (!isValidMove && !ignoreCheck) {
          setNotification("Invalid rook move");
        }
        break;

      case "n": // Knight
        isValidMove =
          (Math.abs(startRow - endRow) === 2 &&
            Math.abs(startCol - endCol) === 1) ||
          (Math.abs(startRow - endRow) === 1 &&
            Math.abs(startCol - endCol) === 2);
        if (!isValidMove && !ignoreCheck) {
          setNotification("Invalid knight move");
        }
        break;

      case "b": // Bishop
        if (Math.abs(startRow - endRow) === Math.abs(startCol - endCol)) {
          const rowDir = (endRow - startRow) / Math.abs(endRow - startRow);
          const colDir = (endCol - startCol) / Math.abs(endCol - startCol);
          let row = startRow + rowDir;
          let col = startCol + colDir;

          isValidMove = true;
          while (row !== endRow && col !== endCol) {
            if (currentBoard[row][col] !== "") {
              isValidMove = false;
              break;
            }
            row += rowDir;
            col += colDir;
          }
        }
        if (!isValidMove && !ignoreCheck) {
          setNotification("Invalid bishop move");
        }
        break;

      case "q": // Queen
        if (
          startRow === endRow ||
          startCol === endCol ||
          Math.abs(startRow - endRow) === Math.abs(startCol - endCol)
        ) {
          const rowDir =
            startRow === endRow
              ? 0
              : (endRow - startRow) / Math.abs(endRow - startRow);
          const colDir =
            startCol === endCol
              ? 0
              : (endCol - startCol) / Math.abs(endCol - startCol);
          let row = startRow + rowDir;
          let col = startCol + colDir;

          isValidMove = true;
          while (row !== endRow || col !== endCol) {
            if (currentBoard[row][col] !== "") {
              isValidMove = false;
              break;
            }
            row += rowDir;
            col += colDir;
          }
        }
        if (!isValidMove && !ignoreCheck) {
          setNotification("Invalid queen move");
        }
        break;

      case "k": // King
        isValidMove =
          Math.abs(startRow - endRow) <= 1 && Math.abs(startCol - endCol) <= 1;
        if (!isValidMove && !ignoreCheck) {
          setNotification("Invalid king move");
        }
        break;
    }

    if (!ignoreCheck && isValidMove && gameStatus === "check") {
      if (!doesMovePreventCheck(startRow, startCol, endRow, endCol)) {
        setNotification("Must move to get out of check!");
        return false;
      }
    }

    return isValidMove;
  };

  // Check if any valid moves exist
  const checkForValidMoves = (isWhite, currentBoard) => {
    for (let startRow = 0; startRow < 8; startRow++) {
      for (let startCol = 0; startCol < 8; startCol++) {
        const piece = currentBoard[startRow][startCol];
        if (piece === "" || (piece === piece.toUpperCase()) !== isWhite)
          continue;

        for (let endRow = 0; endRow < 8; endRow++) {
          for (let endCol = 0; endCol < 8; endCol++) {
            if (
              isLegalMove(
                startRow,
                startCol,
                endRow,
                endCol,
                currentBoard,
                true
              )
            ) {
              // Simulate the move
              const newBoard = currentBoard.map((row) => [...row]);
              newBoard[endRow][endCol] = newBoard[startRow][startCol];
              newBoard[startRow][startCol] = "";

              if (!isInCheck(isWhite, newBoard)) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  };

  // Handle piece selection and movement
  const handleSquareClick = (row, col) => {
    if (gameStatus === "checkmate") return;

    const piece = board[row][col];
    const isWhitePiece = piece === piece.toUpperCase();

    if (selectedPiece) {
      const [startRow, startCol] = selectedPiece;

      if (isLegalMove(startRow, startCol, row, col)) {
        const newBoard = board.map((row) => [...row]);
        newBoard[row][col] = board[startRow][startCol];
        newBoard[startRow][startCol] = "";

        const piece = board[startRow][startCol].toUpperCase();
        const capture = board[row][col] !== "" ? "x" : "";
        const move = `${piece}${capture}${toChessNotation(row, col)}`;

        setBoard(newBoard);
        setSelectedPiece(null);
        setMoveList([...moveList, move]);

        // Check for check/checkmate after move
        const nextTurn = !isWhiteTurn;
        if (isInCheck(nextTurn, newBoard)) {
          const hasValidMoves = checkForValidMoves(nextTurn, newBoard);
          if (!hasValidMoves) {
            setGameStatus("checkmate");
            setNotification("Checkmate!");
          } else {
            setGameStatus("check");
            setNotification("Check!");
          }
        } else {
          setGameStatus("active");
        }

        setIsWhiteTurn(nextTurn);
      } else {
        setSelectedPiece(null);
      }
    } else if (piece) {
      if (isWhitePiece !== isWhiteTurn) {
        setNotification(`It's ${isWhiteTurn ? "White" : "Black"}'s turn`);
        return;
      }
      setSelectedPiece([row, col]);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      {notification && (
        <Alert onClose={() => setNotification(null)}>{notification}</Alert>
      )}

      <div className="flex justify-between w-full mb-4">
        <div className="flex items-center space-x-2">
          <Timer className="w-6 h-6" />
          <span className={`text-lg ${!isWhiteTurn ? "font-bold" : ""}`}>
            Black: {formatTime(blackTime)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Timer className="w-6 h-6" />
          <span className={`text-lg ${isWhiteTurn ? "font-bold" : ""}`}>
            White: {formatTime(whiteTime)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-0 border border-gray-400">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-16 h-16 flex items-center justify-center text-3xl
                ${(rowIndex + colIndex) % 2 === 0 ? "bg-white" : "bg-gray-400"}
                ${
                  selectedPiece &&
                  selectedPiece[0] === rowIndex &&
                  selectedPiece[1] === colIndex
                    ? "bg-yellow-200"
                    : ""
                }
                cursor-pointer
                ${
                  gameStatus === "check" &&
                  piece.toLowerCase() === "k" &&
                  ((piece === "K" && isWhiteTurn) ||
                    (piece === "k" && !isWhiteTurn))
                    ? "bg-red-200"
                    : ""
                }
              `}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {piece && (
                <span
                  className={`
                  ${
                    piece === piece.toUpperCase()
                      ? "text-black"
                      : "text-gray-700"
                  }
                  ${
                    piece.toLowerCase() === "p"
                      ? piece === "P"
                        ? "transform rotate-180"
                        : ""
                      : ""
                  }
                `}
                >
                  {piece === "p" || piece === "P"
                    ? "♟"
                    : piece === "r" || piece === "R"
                    ? "♜"
                    : piece === "n" || piece === "N"
                    ? "♞"
                    : piece === "b" || piece === "B"
                    ? "♝"
                    : piece === "q" || piece === "Q"
                    ? "♛"
                    : piece === "k" || piece === "K"
                    ? "♚"
                    : ""}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 w-full">
        <h3 className="text-lg font-bold mb-2">Move List:</h3>
        <div className="grid grid-cols-2 gap-2">
          {moveList.map((move, index) => (
            <div key={index} className="p-1 bg-gray-100">
              {index + 1}. {move}
            </div>
          ))}
        </div>
      </div>

      {gameStatus === "checkmate" && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          Checkmate! {isWhiteTurn ? "Black" : "White"} wins!
        </div>
      )}
    </div>
  );
};

export default ChessGame;
