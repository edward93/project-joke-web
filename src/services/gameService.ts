export namespace Types {
  /**
   * User session state
   */
  export enum SessionState {
    INITIATED = "INITIATED",
    CONNECTED = "CONNECTED",
    USERNAME_CREATED = "USERNAME_CREATED",
    // USERNAME_CHANGED = "USERNAME_CHANGED",
    JOINED_GAME = "JOINED_GAME",
    LEFT_GAME = "LEFT_GAME",
  }

  /**
   * Enum describing different game states
   */
  export enum GameState {
    // Waiting for players
    WAITING = "WAITING",

    // All players are ready
    READY = "READY",

    // Game has started, typically followed quickly after "READY"
    STARTED = "STARTED",

    // Game has finished
    FINISHED = "FINISHED",
  }

  /**
   * User interface
   */
  export type User = {
    id: string;
    username: string;
  };

  /**
   * Player type
   */
  export interface Player extends User {
    ready: boolean;
  }

  /**
   * Game obj
   */
  export type Game = {
    /**
     * unique id
     */
    id: string;

    /**
     * UserId of the host
     */
    host: string;

    /**
     * List of player ids who are joined this game
     */
    players: { [id: string]: Player };

    /**
     * List of gameSheets, one per player
     */
    gameSheets: { [id: string]: GameSheet };

    /**
     * Current game state
     */
    state: GameState;
  };

  /**
   * Questions type
   */
  export type GameQuestion = {
    id: number;
    question: string;
    answer?: string;
    answeredBy?: string;
    prevAnsweredBy?: string;
  };

  /**
   *
   */
  export type GameSheet = {
    owner: string;
    questions: GameQuestion[];
  };

  /**
   *
   */
  export type SessionUser = {
    id: string;
    username: string;
  };

  /**
   *
   */
  export type Session = {
    state: SessionState;
    currentUser?: SessionUser;
    currentGame?: Game;
  };
}

/**
 * Creates an empty gameSheet obj and adds to the current session's game obj.
 * This game obj then will be passed to the server
 *
 * @param {Types.Session} session - Current Session
 * @returns {[boolean, Types.Session, any]} [success/fail, current session, game obj]
 */
export const createGameSheet = (session: Types.Session, userId: string): [boolean, Types.Session, any] => {
  // game obj must be present
  if (!session.currentGame) {
    // throw new Error("Game object has to be present");
    return [false, session, undefined];
  }

  // init empty gameSheet
  let gameSheet: Types.GameSheet = {
    owner: userId,
    questions: [],
  };

  // add to the current session's game obj
  session = {
    ...session,
    currentGame: {
      ...session.currentGame,
      gameSheets: { ...session.currentGame.gameSheets, [gameSheet.owner]: gameSheet },
    },
  };

  // return
  return [true, session, session.currentGame];
};

/**
 * CHecks if all players in the current game are ready
 * @param {Types.Game} gameObj - Current game object
 * @returns {boolean} True if all players are ready, false otherwise
 */
export const allPlayersReady = (gameObj: Types.Game): boolean => {
  // game obj must be valid
  if (!gameObj) return false;

  // iterate over all players and return false if one of them is not ready yet
  for (const id in gameObj.players) {
    const player = gameObj.players[id];

    if (!player.ready) return false;
  }

  // if everything is fine return true
  return true;
};
