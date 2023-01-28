import { useEffect, useState } from "react";
import io from "socket.io-client";

import "../styles/game.scss";

const socket = io(`${process.env.REACT_APP_SOCKET_URL}`);

type GameState = "UsernameCreated" | "Created" | "Active" | "Suspended" | "Finished";

type Game = {
  currentUser: {};
  gameId?: string;
  gameState: GameState;
  creator: string;
  members?: string[];
};

let game: Game;

const GameComponent = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [gameSessionId, setGameSessionId] = useState<string | undefined>(undefined);

  // const [game, setGame] = useState<Game | null>(null);
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

    //
    socket.on("new user", (username: string) => {
      console.log(`New user has joined: '${username}'`);
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

  /**
   * Handles username submit button click events
   * @param event Click event
   */
  const onCreateUserNameBtnClick = (event: any) => {
    // emit "new user" event
    socket.emit("new user", username);

    // update Game object
    game = {
      currentUser: { [socket.id]: username },
      creator: username ?? "",
      gameState: "UsernameCreated",
    };
  };

  return (
    <div className="pjw-game-container">
      <section className="pjw-game-status-bar">{isConnected ? "connected to the server" : "...connecting"}</section>
      <section className="pjw-game-main-area">
        <section className="pjw-game-left-sidebar">Players</section>
        <section className="pjw-game-mid-area">
          <div className="pjw-game-user-creation">
            <div className="pjw-game-username">
              <input
                className="pjw-input"
                name="game-username"
                type="text"
                value={username}
                placeholder="Create a username"
                onChange={onUsernameChange}
              />
              <div className="pjw-input-bar" />
            </div>
            <button
              className="pjw-create-username-btn"
              onClick={onCreateUserNameBtnClick}
              // disabled={username === undefined || username.length === 0}
              disabled={!username}
            >
              Submit
            </button>
          </div>
          {/* <section className="pjw-information-section">
            <p>{gameSessionId ? `New game with '${gameSessionId}' was created` : "... No games, yet"}</p>
          </section>
          <section className="pjw-user-creation">
            <div className="pjw-user-form">
              <input type="text" value={username} placeholder="Your Username" onChange={onUsernameChange} />
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
                  <button className="pjw-join-another-game-btn" onClick={onJoinAnotherGameClick}>
                    Join Another Game
                  </button>
                </>
              )}
            </div>
          </section>
          <div>Game Session</div> */}
        </section>
      </section>
    </div>
  );
};

export default GameComponent;
