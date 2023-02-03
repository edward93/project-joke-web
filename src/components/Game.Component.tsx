import { useEffect, useState } from "react";
import io from "socket.io-client";

import "../styles/game.scss";

const socket = io(`${process.env.REACT_APP_SOCKET_URL}`);

// type GameState = "UsernameCreated" | "Created" | "Active" | "Suspended" | "Finished";
enum SessionState {
  INITIATED = "INITIATED",
  CONNECTED = "CONNECTED",
  USERNAME_CREATED = "USERNAME_CREATED",
  // USERNAME_CHANGED = "USERNAME_CHANGED",
  JOINED_GAME = "JOINED_GAME",
  LEFT_GAME = "LEFT_GAME",
}

// type Game = {
//   currentUser: {};
//   gameId?: string;
//   gameState: GameState;
//   creator: string;
//   members?: string[];
// };
/**
 * 
 */
type GameQuestion = {
  id: number;
  question: string;
  answer?: string;
  answeredBy?: string;
}

type Game = {
  userId: string;
  questions: GameQuestion[];
}



const GameComponent = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [username, setUsername] = useState<string>("");
  const [gameId, setGameId] = useState<string>("");
  const [session, setSession] = useState<{ [key: string]: any }>({ State: SessionState.INITIATED });

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // new user joined
    socket.on("new user", (username: string) => {
      console.log(`New user has joined: '${username}'`);
    });

    // user created a new game
    socket.on("game created", (game: any) => {
      setGameId(game.id);

      // update the main session with the current game id
      setSession((prevSession) => ({ ...prevSession, currentGame: game, State: SessionState.JOINED_GAME }));
    });

    // new user joined
    socket.on("joined game", async (data: any) => {
      // log
      console.log(`New user: ${data.userId} has joined this game: `, data.game);

      // update the current session
      setSession((prevSession) => ({ ...prevSession, currentGame: data.game, State: SessionState.JOINED_GAME }));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("new user");
      socket.off("game created");
      socket.off("joined game");
    };
  }, []);

  const onUsernameChange = (event: any) => {
    const value = event.target.value;

    setUsername(value);
  };

  /**
   * Handles username submit button click event
   * @param event Click event
   */
  const onCreateUserNameBtnClick = (event: any) => {
    // emit "new user" event
    socket.emit("new user", username);

    // add user to the session obj
    setSession({ ...session, CurrentUser: { id: socket.id, username }, State: SessionState.USERNAME_CREATED });
  };

  /**
   * Handles new game create button click event
   * @param event Click event
   */
  const onCreateGameBtnClick = (event: any) => {
    // emit "create new game" event
    socket.emit("create new game");
  };

  /**
   * Handles join game button click event
   * @param event Click event
   */
  const onJoinGameBtnClick = (event: any) => {
    // emit join game event
    socket.emit("join game", gameId);
  };

  /**
   * Handles game id input change event
   * @param event Input event
   */
  const onGameIdChange = (event: any) => {
    const value = event.target.value;

    setGameId(value);
  };

  return (
    <div className="pjw-game-container">
      <section className="pjw-game-status-bar">
        Connection Status: {isConnected ? "connected to the server" : "...connecting"}
      </section>
      <section className="pjw-game-main-area">
        <section className="pjw-game-left-sidebar">
          {/* <div className="close">
            <button>Close</button>
          </div> */}
          {(session.State === SessionState.USERNAME_CREATED || session.State === SessionState.JOINED_GAME) && (
            <div className="pjw-game-players">
              <div className="pjw-game-current-player">Me: {session?.CurrentUser?.username}</div>
              <div className="pjw-game-other-players">Players ({session?.currentGame?.playersIds?.length ?? 0})</div>
            </div>
          )}
        </section>
        <section className="pjw-game-mid-area">
          {session.State === SessionState.INITIATED && (
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
                className="pjw-create-username-btn ghost-btn"
                onClick={onCreateUserNameBtnClick}
                disabled={!username}
              >
                Submit
              </button>
            </div>
          )}
          {session.State === SessionState.USERNAME_CREATED && (
            <div className="pjw-game-create-or-join-game">
              <div className="pjw-game-join-game">
                <div className="pjw-game-id">
                  <input
                    className="pjw-input"
                    name="game-id"
                    value={gameId}
                    placeholder="Enter game Id"
                    onChange={onGameIdChange}
                    type="text"
                  />
                </div>
                <button className="pjw-join-game-btn ghost-btn" disabled={!gameId} onClick={onJoinGameBtnClick}>
                  Join Game
                </button>
              </div>
              <p>Or Create</p>
              <div className="pjw-game-create-game">
                <button className="pjw-create-game-btn ghost-btn" onClick={onCreateGameBtnClick}>
                  New Game
                </button>
              </div>
            </div>
          )}
          {session.State === SessionState.JOINED_GAME && <div className="pjw-game-level-container"></div>}
        </section>
      </section>
    </div>
  );
};

export default GameComponent;
