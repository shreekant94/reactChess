import React, { useState, useEffect } from 'react';
import { Timer, X } from 'lucide-react';
// Custom Alert Component
const Alert = ({ children, onClose }) => (
  <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
    <span className="block sm:inline">{children}</span>
    {onClose && (
      <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={onClose}>
        <X className="h-4 w-4" />
      </span>
    )}
  </div>
);

// Initial board setup
const initialBoard = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  Array(8).fill(''),
  Array(8).fill(''),
  Array(8).fill(''),
  Array(8).fill(''),
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const ChessGame = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [moveList, setMoveList] = useState([]);
  const [gameStatus, setGameStatus] = useState('active');
  const [notification, setNotification] = useState(null);

  // Timer effect - same as before
  useEffect(() => {
    if (gameStatus === 'checkmate') return;
    
    const timer = setInterval(() => {
      if (isWhiteTurn) {
        setWhiteTime(prev => {
          if (prev <= 0) {
            setGameStatus('checkmate');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 0) {
            setGameStatus('checkmate');
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
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Previous helper functions remain the same
  const toChessNotation = (row, col) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return files[col] + ranks[row];
  };

  const isLegalMove = (startRow, startCol, endRow, endCol) => {
    const piece = board[startRow][startCol];
    const isWhitePiece = piece === piece.toUpperCase();
    
    // Basic validation
    if (endRow < 0 || endRow > 7 || endCol < 0 || endCol > 7) {
      setNotification("Invalid move: Outside the board");
      return false;
    }
    
    if (board[endRow][endCol] !== '' && 
        isWhitePiece === board[endRow][endCol].toUpperCase()) {
      setNotification("Invalid move: Cannot capture your own piece");
      return false;
    }

    const pieceType = piece.toLowerCase();
    
    switch (pieceType) {
      case 'p': // Pawn
        if (isWhitePiece) {
          const isFirstMove = startRow === 6;
          const normalMove = startRow - 1 === endRow && startCol === endCol && board[endRow][endCol] === '';
          const doubleMove = isFirstMove && startRow - 2 === endRow && startCol === endCol && 
                            board[endRow][endCol] === '' && board[startRow - 1][endCol] === '';
          const captureMove = startRow - 1 === endRow && Math.abs(startCol - endCol) === 1 && 
                             board[endRow][endCol] !== '' && board[endRow][endCol] === board[endRow][endCol].toLowerCase();
          
          if (!(normalMove || doubleMove || captureMove)) {
            setNotification("Invalid pawn move");
            return false;
          }
          return true;
        } else {
          const isFirstMove = startRow === 1;
          const normalMove = startRow + 1 === endRow && startCol === endCol && board[endRow][endCol] === '';
          const doubleMove = isFirstMove && startRow + 2 === endRow && startCol === endCol && 
                            board[endRow][endCol] === '' && board[startRow + 1][endCol] === '';
          const captureMove = startRow + 1 === endRow && Math.abs(startCol - endCol) === 1 && 
                             board[endRow][endCol] !== '' && board[endRow][endCol] === board[endRow][endCol].toUpperCase();
          
          if (!(normalMove || doubleMove || captureMove)) {
            setNotification("Invalid pawn move");
            return false;
          }
          return true;
        }
      
      case 'r': // Rook
        if (startRow === endRow || startCol === endCol) {
          const rowDir = startRow === endRow ? 0 : (endRow - startRow) / Math.abs(endRow - startRow);
          const colDir = startCol === endCol ? 0 : (endCol - startCol) / Math.abs(endCol - startCol);
          let row = startRow + rowDir;
          let col = startCol + colDir;
          
          while (row !== endRow || col !== endCol) {
            if (board[row][col] !== '') {
              setNotification("Invalid rook move: Path is blocked");
              return false;
            }
            row += rowDir;
            col += colDir;
          }
          return true;
        }
        setNotification("Invalid rook move: Must move in straight lines");
        return false;
      
      case 'n': // Knight
        const isValid = (Math.abs(startRow - endRow) === 2 && Math.abs(startCol - endCol) === 1) ||
                       (Math.abs(startRow - endRow) === 1 && Math.abs(startCol - endCol) === 2);
        if (!isValid) {
          setNotification("Invalid knight move: Must move in L-shape");
        }
        return isValid;
      
      case 'b': // Bishop
        if (Math.abs(startRow - endRow) === Math.abs(startCol - endCol)) {
          const rowDir = (endRow - startRow) / Math.abs(endRow - startRow);
          const colDir = (endCol - startCol) / Math.abs(endCol - startCol);
          let row = startRow + rowDir;
          let col = startCol + colDir;
          
          while (row !== endRow && col !== endCol) {
            if (board[row][col] !== '') {
              setNotification("Invalid bishop move: Path is blocked");
              return false;
            }
            row += rowDir;
            col += colDir;
          }
          return true;
        }
        setNotification("Invalid bishop move: Must move diagonally");
        return false;
      
      case 'q': // Queen
        if (startRow === endRow || startCol === endCol || 
            Math.abs(startRow - endRow) === Math.abs(startCol - endCol)) {
          const rowDir = startRow === endRow ? 0 : (endRow - startRow) / Math.abs(endRow - startRow);
          const colDir = startCol === endCol ? 0 : (endCol - startCol) / Math.abs(endCol - startCol);
          let row = startRow + rowDir;
          let col = startCol + colDir;
          
          while (row !== endRow || col !== endCol) {
            if (board[row][col] !== '') {
              setNotification("Invalid queen move: Path is blocked");
              return false;
            }
            row += rowDir;
            col += colDir;
          }
          return true;
        }
        setNotification("Invalid queen move: Must move in straight lines or diagonally");
        return false;
      
      case 'k': // King
        const isKingValid = Math.abs(startRow - endRow) <= 1 && Math.abs(startCol - endCol) <= 1;
        if (!isKingValid) {
          setNotification("Invalid king move: Can only move one square in any direction");
        }
        return isKingValid;
      
      default:
        return false;
    }
  };

  const handleSquareClick = (row, col) => {
    if (gameStatus === 'checkmate') return;
    
    const piece = board[row][col];
    const isWhitePiece = piece === piece.toUpperCase();
    
    if (selectedPiece) {
      const [startRow, startCol] = selectedPiece;
      
      if (isLegalMove(startRow, startCol, row, col)) {
        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = board[startRow][startCol];
        newBoard[startRow][startCol] = '';
        
        const piece = board[startRow][startCol].toUpperCase();
        const capture = board[row][col] !== '' ? 'x' : '';
        const move = `${piece}${capture}${toChessNotation(row, col)}`;
        setMoveList([...moveList, move]);
        
        setBoard(newBoard);
        setSelectedPiece(null);
        setIsWhiteTurn(!isWhiteTurn);
        
        const hasKing = newBoard.some(row => 
          row.some(piece => piece === (isWhiteTurn ? 'k' : 'K'))
        );
        
        if (!hasKing) {
          setGameStatus('checkmate');
        }
      } else {
        setSelectedPiece(null);
      }
    } else if (piece) {
      if (isWhitePiece !== isWhiteTurn) {
        setNotification(`It's ${isWhiteTurn ? 'White' : 'Black'}'s turn`);
        return;
      }
      setSelectedPiece([row, col]);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      {notification && (
        <Alert onClose={() => setNotification(null)}>
          {notification}
        </Alert>
      )}

      {/* Rest of the JSX remains exactly the same */}
      <div className="flex justify-between w-full mb-4">
        <div className="flex items-center space-x-2">
          <Timer className="w-6 h-6" />
          <span className={`text-lg ${!isWhiteTurn ? 'font-bold' : ''}`}>
            Black: {formatTime(blackTime)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Timer className="w-6 h-6" />
          <span className={`text-lg ${isWhiteTurn ? 'font-bold' : ''}`}>
            White: {formatTime(whiteTime)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-0 border border-gray-400">
        {board.map((row, rowIndex) => (
          row.map((piece, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-16 h-16 flex items-center justify-center text-3xl
                ${(rowIndex + colIndex) % 2 === 0 ? 'bg-white' : 'bg-gray-400'}
                ${selectedPiece && selectedPiece[0] === rowIndex && selectedPiece[1] === colIndex ? 'bg-yellow-200' : ''}
                cursor-pointer
              `}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {piece && (
                <span className={piece === piece.toUpperCase() ? 'text-black' : 'text-gray-700'}>
                  {piece === 'p' || piece === 'P' ? '♟' :
                   piece === 'r' || piece === 'R' ? '♜' :
                   piece === 'n' || piece === 'N' ? '♞' :
                   piece === 'b' || piece === 'B' ? '♝' :
                   piece === 'q' || piece === 'Q' ? '♛' :
                   piece === 'k' || piece === 'K' ? '♚' : ''}
                </span>
              )}
            </div>
          ))
        ))}
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

      {gameStatus === 'checkmate' && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          Checkmate! {isWhiteTurn ? 'Black' : 'White'} wins!
        </div>
      )}
    </div>
  );
};

export default ChessGame;