const { Router } = require("express");
const router = Router();
const {Envio} = require("../db")

router.post("/", async (req, res) => {
    const { calle, numero, ciudad, provincia, codigoPostal, pisoDepartamento } =
      req.body;
  
    if ((calle, numero, ciudad, provincia, codigoPostal)) {
      Envio.create({
        calle, 
        numero, 
        ciudad, 
        provincia, 
        codigoPostal,
        pisoDepartamento,
      });
      return res.send("direccion creada correctamente");
    } else {
      return res.status(400).send("Please, insert the information correctly");
    }
  });

router.put("/:id", async(req, res) =>{
 
  try {
    const {id} = req.params;
    const {orderId} = req.body;
    const update = await Envio.findByPk(id);

    if(!update){
      return res.status(404).send("Envio not found")
    }
    await update.update({
      orderId
    })

    res.status(200).send("Envio updated successfully");
  } catch (error) {
    console.log(error)
  }
  


})
module.exports = router;