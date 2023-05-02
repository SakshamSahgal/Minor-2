const fs = require('fs');
const regression = require('ml-regression');




function trainPricePrediction(req,res){

  // Load the dataset from the JSON file
  const data = JSON.parse(fs.readFileSync("./Public/Dataset_Training/dataset_for_price_prediction.json"));

  // Select the crop and the year for prediction
  const cropType = req.body.cropType;
  const year = req.body.year;

  // Extract the data for the selected crop
  const cropData = data[cropType];

  // Split the data into features (years) and targets (prices)
  const features = cropData.map(item => item.year);
  const targets = cropData.map(item => item.price);

  // Train the polynomial regression model with degree 2
  const degree = 2;
  const model = new regression.PolynomialRegression(features, targets, degree);

  // Predict the crop price for the provided year
  const predictedPrice = model.predict(year);

  console.log(`The predicted price for ${cropType} in ${year} is: ${predictedPrice}`);
  let PredictedJSON = {
    price : predictedPrice
  }
  res.json(PredictedJSON)
}


function trainDemandPrediction(req,res)
{
  const dataset = JSON.parse(fs.readFileSync("./Public/Dataset_Training/dataset_for_demand_prediction.json"));
  let cropType = req.body.cropType;
  let region = req.body.region;
  let year = req.body.year;
  const data = dataset[region][cropType];
  const yearArray = data.map(d => d.year);
  const demandArray = data.map(d => d.demand);
  console.log(yearArray);
  console.log(demandArray);
  const degree = 2;
  const model = new regression.PolynomialRegression(yearArray, demandArray,degree);
  // Predict the crop price for the provided year
  const predictedDemand = model.predict(year);
  
  console.log(`The predicted demand(in metric Ton) for ${cropType} in ${region} in ${year} is: ${predictedDemand}`);
  let PredictedJSON = {
    Demand : predictedDemand
  }
  res.json(PredictedJSON)

}

module.exports = {trainPricePrediction,trainDemandPrediction};