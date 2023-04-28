const fs = require('fs');
const regression = require('ml-regression');


// Read the dataset from file

function trainData(){

  // Load the dataset from the JSON file
  const data = JSON.parse(fs.readFileSync("./Dataset_Training/dataset_for_price_prediction.json"));

  // Select the crop and the year for prediction
  const cropType = 'Wheat';
  const year = 2022;

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

}




module.exports = {trainData};