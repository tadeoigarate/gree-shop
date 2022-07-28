const { Router } = require("express");
const router = Router();
const { Op } = require("sequelize");
const { Product } = require("../db");
const {
  verifyToken,
  verifyAdminToken,
} = require("../Controllers/verifyToken.js");

router.get("/", async (req, res, next) => {
    try {
      const { name } = req.query;
  
      let products;
      if (name) {
        products = await Product.findAll({
          where: {
            name: {
              [Op.iLike]: `%${name}%`,
            },
          },
        });
      } else {
        products = await Product.findAll();
      }
  
      return res.send(products);
    } catch (error) {
      next(error);
    }
  });
  
  router.get("/destacado", async (req, res) => {
    try {
      const allInfo = await Product.findAll();
  
      if (!allInfo) res.status(404).send({ msj: "No hay productos" });
  
      const filterInfo = allInfo.filter(
        (product) => product.outsanding === "si"
      ); //  <-- TEORICAMENTE TENDRIA QUE HABER UNA CATEGORIA DESTACADO EN EL MODELO
      return res.status(200).send(filterInfo);
    } catch (error) {
      console.log(error);
    }
  });
  
  router.post("/", async (req, res) => {
    const { name, description, image, price, category, stock, outsanding } =
      req.body;
  
    if ((name, description, image, price, category, stock)) {
      Product.create({
        name,
        description,
        image,
        price,
        category,
        stock,
        outsanding,
      });
      return res.send("producto creado correctamente");
    } else {
      return res.status(400).send("Please, insert the information correctly");
    }
  });
  
  router.delete("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedProduct = await Product.findByPk(id);
      if (!deletedProduct) {
        return res.status(404).send("Product not found");
      }
      await deletedProduct.destroy();
      res.status(200).send("Product deleted successfully");
    } catch (error) {
      console.log(error);
    }
  });
  
  router.put("/putProducto/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, image, price, category, outsanding, stock, disabled } =
        req.body;
      const updatedProduct = await Product.findByPk(id);
      if (!updatedProduct) {
        return res.status(404).send("Product not found");
      }
      await updatedProduct.update({
        name,
        description,
        image,
        price,
        category,
        outsanding,
        stock,
        disabled,
      });
      res.status(200).send("Product updated successfully");
    } catch (error) {
      console.log(error);
    }
  });
  
  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const productDetail = await Product.findOne({
        where: {
          id: id,
        },
      });
      return res.status(200).json(productDetail);
    } catch (error) {
      res.status(500).json({ msg: error });
    }
  });
  module.exports = router;
  
