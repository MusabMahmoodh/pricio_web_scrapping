const express = require('express')
const axios = require("axios")

const cheerio = require('cheerio')
const path = require('path');
var bodyParser = require('body-parser');


var app=express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
const port = 3000


// Web scrapping functions
app.set("views", path.join(__dirname,'views'));
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

/***
 * Functions to get data
 */

// Amazon
const getFromAmazon =async (item="") => {
  try{
    let items = []
    const result= await axios.get(`https://www.amazon.com/s?k=${item}`)

    // const $ = cheerio.load(result.data,{
    //   withDomLvl1: true,
    //   normalizeWhitespace: false,
    //   xmlMode: false,
    //   decodeEntities: true
    //   }
    // );
    const $ = cheerio.load(result.data);
    console.log("Here")

    $('.sg-col-20-of-24.s-result-item.s-asin.sg-col-0-of-12.sg-col-28-of-32.sg-col-16-of-20.sg-col.sg-col-32-of-36.sg-col-12-of-16.sg-col-24-of-28').each(function(){ 
      var item = {
        image :$(this).find("img").attr("src"),
        link: `https://www.amazon.com${$(this).find("a").attr("href")}`,
        title:$(this).find("h2").text(),
        price:$(this).find('.a-price').text(),
        coupon:$(this).find('.s-coupon-clipped.aok-hidden').text(),
        shipping:$(this).find('.a-row.a-size-base.a-color-secondary.s-align-children-center').text(),
        rating:$(this).find('.a-icon-alt').text(),
        reviews:$(this).find('.a-link-normal').find(".a-size-base").text()        
      }      
       items.push(item)
    })
    return items
  } catch(err) {
      console.log(err)
  }
}

//function to get from E-bay\
const getFromEbay =async (item="") => {
  try{
    let items = []
    const result= await axios.get(`https://www.ebay.com/sch/i.html?_nkw=${item}`)

    const $ = cheerio.load(result.data);
    console.log("Here")

    $('.s-item.s-item--watch-at-corner').each(function(){ 
      var item = {
        image :$(this).find('.s-item__image-img').attr("src"),
        link: $(this).find("a").attr("href"),
        title:$(this).find(".s-item__title.s-item__title--has-tags").text(),
        price:$(this).find(".s-item__price").text(),
        discount:$(this).find(".s-item__discount.s-item__discount").text(),
        shippingFrom:$(this).find(".s-item__location.s-item__itemLocation").text(),    
        shippingCost:$(this).find(".s-item__shipping.s-item__logisticsCost").text(),    
        description:$(this).find('.s-item__subtitle').text(),
        hotness:$(this).find('.a-link-normal').find(".s-item__hotness.s-item__itemHotness").text()        
      }      
       items.push(item)
    })
    
    return items
  } catch(err) {
      console.log(err)
  }
}


/**
 * API requests
 */
// Get request
app.get('/',async  (req, res) => {

  
  console.log("started")
  try {
    const amazon =await getFromAmazon()  
    const ebay =await getFromEbay()  

    //rendering
    res.render("index",{
      "amazon":amazon,
      "ebay":ebay
    })  
  } catch (err) {
    console.log(err)
  }
  
    
  
  console.log("done")
  
})
// Post request
app.post('/', async (req, res) => {
  let queryItem = req.body.search
  console.log(req.body.search)
  try {
    const amazon =await getFromAmazon(queryItem)  
    const ebay =await getFromEbay(queryItem)  

    //rendering
    res.render("index",{
      "amazon":amazon,
      "ebay":ebay
    })  
  } catch (err) {
    console.log(err)
  }
  res.send('POST request to the homepage')
})


// ///////////////////
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})