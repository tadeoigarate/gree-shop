const { Router } = require("express");
const router = Router();
const mercadopago = require("mercadopago");
const { Orderline, Order} = require('../db.js');

const { TOKEN_MP } = process.env;

const BASE_URL = 'http://localhost:3000'  


//REPLACE WITH YOUR ACCESS TOKEN AVAILABLE IN: https://developers.mercadopago.com/panel/credentials
mercadopago.configure({
  access_token: TOKEN_MP 
})

router.get("/:orderId", (req, res, next)=>{
  //const orderId = req.query.id 
  const {orderId} = req.params
  const {jk} = req.body


  // cargamos el carrido de la bd
  const carrito = [
    {title: "Abono Delta 8 NPK (9-0-1) Con aminoácidos 500cc", quantity: 1, price: 10000},
    {title: "Hortal Granulado 100g", quantity: 2, price: 220},
    {title: "Hortal Granulado 250g", quantity: 2, price: 310}
  ]
  // Agrega credenciales
mercadopago.configure({
    access_token: TOKEN_MP
  });
  
  console.info('ml configured')
  const items_ml = carrito.map(i => ({
    title: i.title,
    unit_price: i.price,
    quantity: i.quantity,
  }))
  console.info('carrito', items_ml)
  // Crea un objeto de preferencia
  let preference = {
    items: items_ml,
    external_reference : `${orderId}`, //`${new Date().valueOf()}`,
    back_urls: {
      success: BASE_URL,
      failure: BASE_URL,
      pending: BASE_URL,
    }
  };
  console.info('preference:', preference)
  mercadopago.preferences.create(preference)

  .then(function(response){
    console.info('respondio')
  // Este valor reemplazará el string"<%= global.id %>" en tu HTML
    global.id = response.body.id;
    console.log(response.body)
    res.json({id: global.id, init_point: response.body.init_point});
  }).catch(function(error){
    console.log(error);
  })


}) 

router.get("/pagos/:id", (req, res)=>{
  const mp = new mercadopago (TOKEN_MP)
  const id = req.params.id
  console.info("Buscando el id", id)
  mp.get(`/v1/payments/search`, {'status': 'pending'})//{"external_reference":id})
  .then(resultado  => {
    console.info('resultado', resultado)
    res.json({"resultado": resultado})
  })
  .catch(err => {
    console.error('No se consulto:', err)
    res.json({
      error: err
    })
  })

})

router.get("/pagos", (req, res)=>{
  console.info("EN LA RUTA PAGOS ", req)
  const payment_id= req.query.payment_id
  const payment_status= req.query.status
  const external_reference = req.query.external_reference
  const merchant_order_id= req.query.merchant_order_id
  console.log("EXTERNAL REFERENCE ", external_reference)

  //Aquí edito el status de mi orden

  Order.findByPk(external_reference)
  .then((order) => {
    order.payment_id= payment_id
    order.payment_status= payment_status
    order.merchant_order_id = merchant_order_id
    order.status = "created"
    console.info('Salvando order')
    order.save()
    .then((_) => {
      console.info('redirect success')
      
      return res.redirect(`${BASE_URL}`)
    }).catch((err) =>{
      console.error('error al salvar', err)
      return res.redirect(`${BASE_URL}/?error=${err}&where=al+salvar`)
    })
  }).catch(err =>{
    console.error('error al buscar', err)
    return res.redirect(`${BASE_URL}/?error=${err}&where=al+buscar`)
  })


  //proceso los datos del pago 
  // redirijo de nuevo a react con mensaje de exito, falla o pendiente
  //res.send(`${payment_id} ${payment_status} ${external_reference} ${merchant_order_id} `)
})


module.exports = router;