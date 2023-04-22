// Preprocess the JSON data
const jsonData =  require("../Dataset_Training/dataset.json");

// console.log(jsonData)
  
const numericalData = jsonData.map(entry => { //converting dataset to numerical value
    const name = entry.Name;
    const contact = entry.Contact;
    const crops = [];
    const prices = [];
    entry.Intake.forEach(intake => {
      crops.push(intake.crop);
      prices.push(intake.price_per_kg);
    });
    const x = entry.location.x;
    const y = entry.location.y;
    const rating = entry.rating;
    console.log([name, contact, ...crops, ...prices, x, y, rating])
    return [name, contact, ...crops, ...prices, x, y, rating];
  });
  