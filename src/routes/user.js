const { Router } = require("express");
const router = Router();
const { User } = require("../db");
const { Op } = require("sequelize");
const { encrypt, decrypt } = require("../Controllers/encrypt.js");
const jwt = require("jsonwebtoken");
const {
  verifyToken,
  verifyAdminToken,
} = require("../Controllers/verifyToken.js");
const { transport } = require("../Controllers/transport.js");
const nodemailer = require("nodemailer");

router.get("/allUsers", async (req, res) => {
  try {
    const result = await User.findAll({
      attributes: [
        "id",
        "username",
        "email",
        "profile_img",
        "is_admin",
        "disabled",
      ],
    });
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { userName } = req.query;

    let findUser;
    if (userName) {
      findUser = await User.findAll({
        where: {
          username: {
            [Op.iLike]: `%${userName}%`,
          },
        },
      });
    }

    return res.send(findUser);
  } catch (error) {
    return res.status(400).json({ error: "user not found" });
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  //para loguearse debe enviar username o email
  //console.log(req.body.password);
  let result;
  if (req.body.username) {
    result = await User.findOne({
      where: {
        username: req.body.username,
      },
    });
  } else if (req.body.email) {
    result = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
  } else {
    return res.status(400).json({ error: "Mandatory data was not sent" });
  }
  //console.log(result);
  const userDb = result?.dataValues;
  if (userDb && userDb.disabled == "no") {
    //desencriptar la contraseña
    const userPassword = decrypt(userDb.password);
    //console.log(userDb.password, userDb, decrypt(userDb.password));
    //verifica que las contraseñas sean iguales
    if (userPassword === req.body.password) {
      userDb.password = userPassword;
      //Evalua el rol
      let role = [];

      if (userDb.is_admin == "si") role.push("Admin");
      if (!role) role.push("Client");

      role = role.join(" ");
      console.log("role ", role);
      //crea el token de acceso
      const accessToken = jwt.sign(
        {
          userId: userDb.id,
          role,
        },
        process.env.JWT_KEY,
        { expiresIn: 60 * 60 * 24 }
      );

      return res.status(200).json({
        userId: userDb.id,
        username: userDb.username,
        email: userDb.email,
        profileImg: userDb.profile_img,
        isAdmin: userDb.is_admin,
        accessToken,
      });
    }
    return res.status(400).json({ error: "Invalid password" });
  }
  return res.status(400).json({ error: "Invalid email/username" });
});

//Register
router.post("/register", async (req, res) => {
  //Recibe la info y chequea que esté completa
  let { email, username, password } = req.body;
  if (!email || !username || !password)
    return res.status(400).json({ error: "Some fields were empty" });
  //encripta la contraseña
  req.body.password = encrypt(req.body.password);
  //Comprueba que no exisa un email igual en la base de datos
  let result = await User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (!result) {
    try {
      await User.create(req.body);
      console.log(
        await User.findOne({
          where: {
            email: req.body.email,
          },
        })
      );
      //Envio de correo de confirmación de usuario
      const mailOptions = {
        from: "greenshopG14@outlook.com", // Sender address
        to: email, // List of recipients
        subject: "Usuario creado!", // Subject line
        text: "Usuario creado con éxito! Bienvenido a la tienda GREENSHOP!", // Plain text body
      };

      transport.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
        }
      });

      return res.status(200).json({ success: "User created successfully" });
    } catch (error) {
      console.log("Este es el error", error);
      return res.status(400).json(error);
    }
  }
  res.status(400).json({ error: "User already exists" });
});

//Modifica datos de usuario

router.put("/update/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { profile_img, username, email, password } = req.body;
  const target = await User.findByPk(userId)
    .then((result) => result.dataValues)
    .catch(() => false);
  // console.log(target);
  if (!target)
    return res
      .status(400)
      .send({ error: "User ID was not found in the database" });

  //se evalua la información enviada
  if (password && !/(?=.*\d).{8,}$/.test(password))
    return res.status(400).send({
      error: "Password must contain at least 8 characters and 1 number",
    });
  if (
    email &&
    !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    )
  )
    return res.status(400).send({ error: "Invalid email format." });

  //no logré que funcionara la validación de la imagen
  //lo dejo por si alguien quiere revisarlo
  // if (
  //   profile_img &&
  //   !/https?:\/\/.+(\.(a?png|gif|p?jpe?g|jfif|pjp|webp|pdf|svg|avif|jxl|bmp|ico|cur|tiff?))+[\s\S]*(media)+[\s\S]*/i.test(
  //     profile_img
  //   )
  // )
  //   return res.status(400).send({ error: "Invalid image link." });

  if (username && username.length < 5)
    return res
      .status(400)
      .send({ error: "Username must be at least 5 characters long" });

  const success = await User.update(
    {
      password: password ? encrypt(password) : target.password,
      username: username ? username : target.username,
      email: email ? email : target.email,
      profile_img: profile_img ? profile_img : target.profile_img,
    },
    {
      where: {
        id: userId,
      },
    }
  ).then((result) => result[0]);
  if (success) {
    res.status(200).send({
      success: "Successfully updated user information",
      username,
      password,
      email,
      profile_img,
    });
  } else {
    res
      .status(500)
      .send({ error: "There was an error while processing your request" });
  }
  res.status(400).json({ error: "User already exists" });
});

router.delete("/delete/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await Product.findByPk(userId);
    if (!deletedUser) {
      return res.status(404).send("User not found");
    }
    await deletedUser.destroy();
    res.status(200).send("User deleted successfully");
  } catch (error) {
    console.log(error);
  }
});

router.put("/modified/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { profile_img, username, email, is_admin, disabled } = req.body;

    const updateUser = await User.findByPk(id);

    if (!updateUser) {
      return res.status(404).send("User not found");
    }

    await updateUser.update({
      profile_img,
      username,
      email,
      is_admin,
      disabled,
    });

    res.status(200).send("User updated successfully");
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const userDetail = await User.findOne({
      where: {
        id: id,
      },
    });
    return res.status(200).json(userDetail);
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

router.post("/forgotPassword", async (req, res) => {
  // RECIBE EL EMAIL
  const { email } = req.body;

  try {
    // BUSCA EL USUARIO CON EL EMAIL
    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    // GENERA UN TOKEN DE ACCESO
    const accessToken = jwt.sign(
      {
        email: user.email,
        userId: user.id,
      },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 * 24 }
    );
    const transporter = nodemailer.createTransport({
      service: "outlook",
      secure: false,
      auth: {
        user: "greenshopG14@outlook.com",
        pass: "greenshop789",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const mailOptions = {
      from: "greenshopG14@outlook.com",
      to: email,
      subject: "Recuperación de contraseña",
      text: `Hola, ${user.username}!\n\n
      Para recuperar tu contraseña, haz click en el siguiente enlace: \n
      https://pf-eccomerce.vercel.app/${user.id}/${accessToken} \n\n
      Si no has solicitado un cambio de contraseña, puedes ignorar este correo.\n
      `,
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });
    return res.status(200).json({ success: "Email sent" });
  } catch (error) {
    console.log("Este es el error", error);
    return res.status(400).json(error);
  }
});

// resetPassword with token for query
router.post("/resetPassword/:id/:token", async (req, res) => {
  // si me viene un token por url cambio la contraseña y lo redirijo a la página de login
  const { id, token } = req.params;
  const { password, changePassword } = req.body;
  try {
    //
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (password !== changePassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const success = await User.update(
      {
        password: encrypt(password),
        accessToken: "",
      },
      {
        where: {
          id,
        },
      }
    ).then((result) => result[0]);
    if (success) {
      res.status(200).send({ success: "Password changed" });
    } else {
      res
        .status(500)
        .send({ error: "There was an error while processing your request" });
    }
  } catch (error) {
    console.log("Este es el error", error);
    return res.status(400).json(error);
  }
});

module.exports = router;
