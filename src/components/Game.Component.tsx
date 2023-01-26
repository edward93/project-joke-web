import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io(`${process.env.REACT_APP_SOCKET_URL}`);

const GameComponent = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [username, setUsername] = useState("");
  const [gameSessionId, setGameSessionId] = useState<string | undefined>(
    undefined
  );
  const [activeGame, setActiveGame] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("game-created", (gameSessionId: string) => {
      setGameSessionId(gameSessionId);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
    };
  }, []);

  const onUsernameChange = (event: any) => {
    const value = event.target.value;

    setUsername(value);
  };

  const onCreateGameClick = (event: any) => {
    // create a game
    socket.emit("create-game", username);
  };

  const onJoinClick = (event: any) => {
    // join the current game
    socket.emit("join-game", gameSessionId);
  };

  const onGameSessionIdChange = (event: any) => {
    const value = event.target.value;

    setGameSessionId(value);
  };

  const onJoinAnotherGameClick = (event: any) => {
    // join someone else's game
    socket.emit("join-game", gameSessionId);
  };

  return (
    <div className="pjw-game-container">
      <h1>The Best Game</h1>
      <section className="pjw-information-section">
        <p>{isConnected ? "Connected to the server" : "...Connecting"}</p>
        <p>
          {gameSessionId
            ? `New game with '${gameSessionId}' was created`
            : "... No games, yet"}
        </p>
      </section>
      <section className="pjw-user-creation">
        <div className="pjw-user-form">
          <input
            type="text"
            value={username}
            placeholder="Your Username"
            onChange={onUsernameChange}
          />
          <button className="pjw-create-game" onClick={onCreateGameClick}>
            Create a Game
          </button>
          {gameSessionId ? (
            <button className="pjw-join-game-btn" onClick={onJoinClick}>
              Join
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Game Session Id"
                value={gameSessionId}
                onChange={onGameSessionIdChange}
              />
              <button
                className="pjw-join-another-game-btn"
                onClick={onJoinAnotherGameClick}
              >
                Join Another Game
              </button>
            </>
          )}
        </div>
      </section>
      <div>Game Session</div>
    </div>
  );
};

export default GameComponent;
