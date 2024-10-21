import express from "express";
import DateTime from "../DateTime.js";
import multer from "multer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const routerPropietario = (app, db) => {
  const router = express.Router();

  // Configurar Multer
  const storage = multer.memoryStorage(); // Almacenar el archivo en memoria
  const upload = multer({ storage: storage });

  // Ruta para envio de solicitud de cuenta
  router.post("/register", upload.single("Archivo"), (req, res) => {
    console.log(req);
    const { Nombre, Apellido, NumeroDocumento, Tel, Correo, CodigoVivienda } =
      req.body;
    const file = req.file.buffer;
    const sql = "Call Creacion_solicitud_cuenta(?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(
      sql,
      [
        DateTime().fecha,
        DateTime().hora,
        Nombre,
        Apellido,
        NumeroDocumento,
        Tel,
        Correo,
        CodigoVivienda,
        file,
      ],
      (err, data) => {
        if (err) {
          console.error("Error en la consulta:", err); // Muestra el error en el servidor
          return res
            .status(500)
            .json({ Error: "Error al enviar solicitud de registro" });
        }
        return res.json(data);
      }
    );
  });

  // Ruta para inicio de sesión en propietario
  router.post("/loginPropietario", (req, res) => {
    const sql = "SELECT * FROM login_propietario WHERE nombreUsuario = ?";
    db.query(sql, [req.body.Usuario], (err, data) => {
      if (err) {
        console.error("Error al iniciar sesión", err); // Muestra el error en el servidor
        return res
          .status(500)
          .json({ Error: "Error al enviar solicitud de registro" });
      }
      if (data.length > 0) {
        bcrypt.compare(
          req.body.Pass.toString(),
          data[0].clave,
          (err, response) => {
            if (err)
              return res.json({ Error: "Error al comparar constraseñas" });
            if (response) {
              const Usuario = data[0].nombreUsuario;
              const token = jwt.sign({ Usuario }, "jwt-secret-key", {
                expiresIn: "1d",
              });
              res.cookie("token", token);
              return res.json({ Status: "Success" });
            } else {
              return res.json({ Error: "Las constraseñas no coinciden" });
            }
          }
        );
      } else {
        return res.json({
          Error: "Nombre de usuario o contraseña incorrectos",
        });
      }
    });
  });

  // Agregar el router al prefijo /users
  app.use("/propietario", router);
};

export default routerPropietario;
