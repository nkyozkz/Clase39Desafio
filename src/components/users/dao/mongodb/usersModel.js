import mongoose from "mongoose";
import { userSchema } from "./usersSchema.js";
import { CartController } from "../../../carts/cartController.js";

const userCollection = "users";

const userModel = mongoose.model(userCollection, userSchema);

export class UsersModel {
  constructor() {
    this.db = userModel;
  }
  createUser = async (user) => {
    let cartController = new CartController();
    let cart = await cartController.createCart();
    user.cart = cart._id;
    return await this.db.create(user);
  };
  searchUser = async (email) => {
    console.log(email)
    return await this.db.findOne({ email: email });
  };
  searchUserById = async (id) => {
    return await this.db.findById(id);
  };
  searchUserByCartId=async (cartID) => {
    return await this.db.findOne({ cart: cartID });
  };
  updateUser = async (email, nuevaInformacion) => {
    let user = await userModel.find({ email: email });
    if (user.length > 0) {
      if (nuevaInformacion) {
        await this.db.updateOne({ email: email }, nuevaInformacion);
        return {
          status: 200,
          response: "Actualizado correctamente",
        };
      } else {
        return {
          status: 400,
          response: "Coloca la información a cambiar",
        };
      }
    } else {
      return {
        status: 400,
        response: "El id del producto no existe",
      };
    }
  };
}
