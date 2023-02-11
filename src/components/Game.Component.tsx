import { useEffect, useState } from "react";
import io from "socket.io-client";

import { Types } from "../services/gameService";
import Session = Types.Session;
import SessionState = Types.SessionState;

import "../styles/game.scss";
//TODO: add redux

const socket = io(`${process.env.REACT_APP_SOCKET_URL}`);

const GameComponent = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [username, setUsername] = useState<string>("");
  const [gameId, setGameId] = useState<string>("");
  const [session, setSession] = useState<Session>({ state: SessionState.INITIATED });

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // new user joined
    socket.on("new user", (user: Types.User) => {
      console.log(`New user has joined: '${user.username}'`);
    });

    // user created a new game
    socket.on("game created", (game: Types.Game) => {
      setGameId(game.id);

      // update the main session with the current game id
      setSession((prevSession) => ({ ...prevSession, currentGame: game, state: SessionState.JOINED_GAME }));
    });

    // new user joined
    socket.on("joined game", async (data: any) => {
      // log
      console.log(`New user: ${data.userId} has joined this game: `, data.game);

      // update the current game obj and session state
      setSession((prevSession) => ({ ...prevSession, currentGame: data.game, state: SessionState.JOINED_GAME }));
    });

    // player is ready
    socket.on("player ready", (game: Types.Game) => {
      // log
      console.log(`Player is ready`, game);

      // update the current game obj
      setSession((prevSession) => ({ ...prevSession, currentGame: game }));
    });

    // game started
    socket.on("game started", (game: Types.Game) => {
      // log
      console.log(`Game has started`);

      // update the current game obj
      setSession((prevSession) => ({ ...prevSession, currentGame: game }));
    })

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("new user");
      socket.off("game created");
      socket.off("joined game");
      socket.off("player ready");
    };
  }, []);

  /**
   * Handles username input changes
   * @param event input event
   */
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
    setSession({ ...session, currentUser: { id: socket.id, username }, state: SessionState.USERNAME_CREATED });
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

  /**
   * Handles ready player btn click
   * @param event click event
   */
  const onReadyPlayerClick = (event: any) => {
    // emit ready player event
    socket.emit("ready player", { gameId: session.currentGame?.id, userId: session.currentUser?.id });
  };

  /**
   * Handles start game btn click
   * @param event click event
   */
  const onStartGameClick = (event: any) => {
    // emit start game event
    socket.emit("start game", session.currentGame?.id, session.currentUser?.id);
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
          {(session.state === SessionState.USERNAME_CREATED || session.state === SessionState.JOINED_GAME) && (
            <div className="pjw-game-players">
              <div className="pjw-game-current-player">Me: {session?.currentUser?.username}</div>
              <div className="pjw-game-other-players">
                Players ({Object.keys(session?.currentGame?.players ?? {}).length})
              </div>
            </div>
          )}
        </section>
        <section className="pjw-game-mid-area">
          {session.state === SessionState.INITIATED && (
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
          {session.state === SessionState.USERNAME_CREATED && (
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
          {session.state === SessionState.JOINED_GAME && (
            <div className="pjw-game-level-container">
              {session.currentGame?.state === Types.GameState.WAITING && (
                <div className="pjw-game-waiting-state-setup">
                  <div className="pwj-game-waiting-state-text">
                    <p>Waiting for other players...</p>
                  </div>
                  {session.currentUser && !session.currentGame?.players?.[session.currentUser.id]?.ready && (
                    <div className="pjw-game-ready-player">
                      <button className="pjw-game-ready-player-btn ghost-btn" onClick={onReadyPlayerClick}>
                        Ready
                      </button>
                    </div>
                  )}
                </div>
              )}
              {session.currentGame?.state === Types.GameState.READY && (
                <>
                  <div className="pjw-game-ready-state-setup">Game is ready</div>

                  {session.currentUser?.id === session.currentGame?.host && (
                    <div className="pjw-game-start-game">
                      <button className="pjw-game-start-game ghost-btn" onClick={onStartGameClick}>
                        Start
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </section>
    </div>
  );
};

export default GameComponent;
