export interface PlayerRegisterDto {
  name: string;
  password: string;
}

export interface PlayerDto {
  name: string;
  index: number;
}

export interface Winner {
  name: string;
  wins: number;
}
