import { Router } from "express";
import { authToken } from "../../middlewares/authMiddlewares.js";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

router.put("/:uid", authToken, async (req, res) => {
  let { uid } = req.params;
  if (req.user._id == uid) {
    await fetch("http://localhost:8080/api/sessions/premium", {
      method: "PUT",
      headers: {
        token: process.env.ADMIN_ADD_PRODUCT_TOKEN,
        updateUser: uid,
      },
    })
      .then((res) => res.json())
      .then((response) => res.status(response.status).send(response.response));
  } else {
    return res
      .status(400)
      .send(
        "El uid enviado no coincide con tu token, porfavor coloca correctamente los datos"
      );
  }
});
export default router;
