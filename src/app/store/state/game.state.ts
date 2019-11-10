export interface GameStateInterface {
  gameOn: boolean;
  gameOver: boolean;
  playerIsShooter: boolean;
  readyToPlay: boolean;
  winner: string;
  mode: string;
  messages: string[];
}

export const initialGameState = {
  gameOn: false,
  gameOver: false,
  playerIsShooter: false,
  readyToPlay: false,
  winner: '',
  mode: '',
  messages: []
};
