const {Review } = require("../db");
const { Router } = require("express");
const router = Router();

router.get("/",async (req, res) => {
  try {
    const prod = await Review.findAll();
    return res.send(prod);
  } catch (error) {
    console.log(error);
  }
});

router.get("/:productId",async (req, res) => {
  try {
    const { productId } = req.params;

    const prod = await Review.findAll({
      where: {
        productId: productId,
      },
    });

    return res.send(prod);
  } catch (error) {
    console.log(error);
  }
});

router.post("/post", async (req, res) => {
    try {
      let { review, valoration, productId, userId } = req.body;
  
      const newReview = await Review.create({
        productId,
        valoration,
        review,
        userId,
      });
      return res.send(newReview);
    } catch (error) {
      console.log(error);
    }
  });

  router.delete("/delete/:ReviewId",async (req, res) => {
    try {
      const { ReviewId } = req.params;
      const revi = await Review.findByPk(ReviewId);
      await revi.destroy();
  
      return res.status(200).send("review eliminada");
    } catch (error) {
      console.log(error);
    }
  });

  module.exports = router;
