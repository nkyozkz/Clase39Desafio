import { UsersServices } from "./userServices.js";

export class UserController {
  constructor() {
    this.userService = new UsersServices();
  }
  createUser = (user) => {
    return this.userService.createUser(user);
  };
  searchUser = (email) => {
    return this.userService.searchUser(email);
  };
  searchUserById = (id) => {
    return this.userService.searchUserById(id);
  };
  updateUser = (email, nuevaInformacion) => {
    return this.userService.updateUser(email, nuevaInformacion);
  };
  searchUserByCartId = (id) => {
    return this.userModel.updateUser(id);
  };
}
