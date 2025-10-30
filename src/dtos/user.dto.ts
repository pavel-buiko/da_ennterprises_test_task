export class UserDto {
  id: string;
  login: string;

  constructor(user: { id: string; login: string }) {
    this.id = user.id;
    this.login = user.login;
  }
}
