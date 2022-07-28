const { Product, Review } = require("../db");
const { Router } = require("express");
const router = Router();

router.get("/asc", async (req, res) => {
  try {
    let az = await Product.findAll({
      order: [["name", "ASC"]],
      // include: [Review]
    });
    return res.status(200).send(az);
  } catch (error) {
    console.log(error);
  }
});

router.get("/desc", async (req, res) => {
  try {
    let za = await Product.findAll({
      order: [["name", "DESC"]],
      //include: [Review]
    });
    return res.status(200).send(za);
  } catch (error) {
    console.log(error);
  }
});

router.get("/maxPrice", async (res, req) => {
  try {
    let maxPrice = await Product.findAll({
      order: [["price", "DESC"]],
      //include: [Review]
    });
    return res.status(200).send(maxPrice);
  } catch (error) {
    console.log(error);
  }
});

router.get("/minPrice", async (res, req) => {
  try {
    let minPrice = await Product.findAll({
      order: [["price", "ASC"]],
      //include: [Review]
    });
    return res.status(200).send(minPrice);
  } catch (error) {
    console.log(error);
  }
});

router.get("/maxValoration", async (res, req) => {
  try {
    let maxValoration = await Product.findAll({
      order: [["valoration", "DESC"]],
      //include: [Review]
    });
    return res.status(200).send(maxValoration);
  } catch (error) {
    console.log(error);
  }
});

router.get("/minValoration", async (res, req) => {
  try {
    let minValoration = await Product.findAll({
      order: [["valoration", "ASC"]],
      //include: [Review]
    });
    return res.status(200).send(minValoration);
  } catch (error) {
    console.log(error);
  }
});

router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    let byCategory = await Product.findAll({
      where: {
        category: category,
      },
      //include: [Review]
    });
    return res.status(200).send(byCategory);
  } catch (error) {
    res.status(500).json({ msg: err });
  }
});

module.exports = router;