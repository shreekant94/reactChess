import { useState } from "react";
import ChessGame from "./ChessGame";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="App">
        <ChessGame />
      </div>
    </>
  );
}

export default App;
