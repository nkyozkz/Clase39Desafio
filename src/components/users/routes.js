import express from "express";
import passport from "passport";

import dotenv from "dotenv";
import {
  authorization,
  authToken,
  generatePasswordToken,
  authPasswordToken,
} from "../../middlewares/authMiddlewares.js";
import { UserController } from "./userController.js";

import { transport } from "../../services/email/nodemailer.js";
import { DataUserDTO } from "./dto/userDataDto.js";
import {
  createHash,
  isValidPassword,
} from "../../middlewares/passwordMiddlewares.js";

dotenv.config();
const router = express.Router();
let userController = new UserController();

router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/api/sessions/faillogin",
  }),
  async (req, res) => {
    if (!req.user) {
      return res
        .status(400)
        .send({ status: 400, response: "Usuario no identificado" });
    }

    return res.status(200).send({
      status: 200,
      message:
        "Inicio de sesion exitoso, recuerde no compartir el token con nadie y utilizarlo en el header con la key auth",
      response: req.user,
    });
  }
);

router.get("/faillogin", (req, res) => {
  return res.status(401).send({
    status: 401,
    response: "Usuario y/o contraseña incorrectos",
  });
});

//Todo --> REGISTER
router.post(
  "/createUser",
  passport.authenticate("register", {
    failureRedirect: "/session/failregister",
  }),
  async (req, res) => {
    return res.status(200).send({
      status: 200,
      response: "Usuario creado exitosamente",
    });
  }
);

router.get("/failregister", (req, res) => {
  return res.status(401).send({
    status: 400,
    response: "Email ya registrado, ingresa otro email",
  });
});

router.get("/current", authToken, async (req, res) => {
  let returnUser = new DataUserDTO(req.user);
  res.status(200).send({
    status: 200,
    response: returnUser,
  });
});

router.get("/updatePassword", async (req, res) => {
  let { email } = req.body;
  if (email) {
    const token = generatePasswordToken(email);
    transport.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Restablecimiento de contraseña",
      html: `
              <div>
                  <h2>Para restablecer su contraseña <a href="http://localhost:8080/api/sessions/changePassword/${token}" target="_blank">Clik aqui</a></h2>
              </div>
          `,
      attachments: [],
    });
    return res
      .status(200)
      .send(
        `Se ha enviado un correo a ${email} para restablecer la contraseña`
      );
  } else {
    return res
      .status(400)
      .send("Porfavor envia el correo electronico en el body");
  }
});

router.get("/changePassword/:token", authPasswordToken, async (req, res) => {
  let { contraseña } = req.body;
  if (contraseña) {
    let user = await userController.searchUser(req.user.response);
    console.log(req.user.response)
    if (isValidPassword(user, contraseña)) {
      return res
        .status(422)
        .send(`Coloca una contraseña diferente a la actual`);
    } else {
      let hashPassword = createHash(contraseña);
      let result = await userController.updateUser(user.email, {
        password: hashPassword,
      });
      return res.status(result.status).send(result);
    }
  }
  return res
    .status(422)
    .send(
      `Coloca la nueva contraseña en el body como {"contraseña":"nueva contraseña"} y reenvia la petición`
    );
});

router.put("/premium", authorization("admin"), async (req, res) => {
  let user = await userController.searchUserById(req.headers.updateuser);
  if (user.rol == "user") {
    let result = await userController.updateUser(user.email, {
      rol: "premium",
    });
    return res.status(result.status).send(result);
  } else if (user.rol == "premium") {
    let result = await userController.updateUser(user.email, { rol: "user" });
    return res.status(result.status).send(result);
  }
  return res.status(400).send({
    status: 400,
    response: "Los administradores no pueden cambiar su rol",
  });
});

export default router;
