const express = require('express')
const axios = require("axios")

const cheerio = require('cheerio')
const path = require('path');
 

const app = express()
const port = 3000


// Web scrapping functions
app.set("views", path.join(__dirname,'views'));
app.set('view engine', 'ejs')


// Functions
const getFromAmazon =async (item) => {
  try{
    let items = []
    const result= await axios.get("https://www.amazon.com/s?k=headset")

    const $ = cheerio.load(result.data,{
      withDomLvl1: true,
      normalizeWhitespace: false,
      xmlMode: false,
      decodeEntities: true
      }
    );
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

// Get request
app.get('/',async  (req, res) => {

  
  console.log("started")
  const amazon =await getFromAmazon()  
    // var list = [];
  res.render("index",{
    "amazon":amazon
  })  
    
  
  console.log("done")
  
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})