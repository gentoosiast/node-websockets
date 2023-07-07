export interface PlayerDto {
  name: string;
  password: string;
}

export interface Player extends PlayerDto {
  index: number; // Player id
}
