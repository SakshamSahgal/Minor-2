const fs = require('fs');
const regression = require('ml-regression');
const tf = require('@tensorflow/tfjs');



function trainPricePrediction(req, res) {

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

  console.log(`The predicted price using Regression for ${cropType} in ${year} is: ${predictedPrice}`);
  let PredictedJSON = {
    price: predictedPrice
  }
  res.json(PredictedJSON)
}


function trainDemandPrediction(req, res) {
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
  const model = new regression.PolynomialRegression(yearArray, demandArray, degree);
  // Predict the crop price for the provided year
  const predictedDemand = model.predict(year);

  console.log(`The predicted demand(in metric Ton) for ${cropType} in ${region} in ${year} is: ${predictedDemand}`);
  let PredictedJSON = {
    Demand: predictedDemand
  }
  res.json(PredictedJSON)

}


async function trainPricePredictionUsingGAN() {

  // Load dataset
  const dataset = JSON.parse(fs.readFileSync("./Public/Dataset_Training/dataset_for_price_prediction.json"));

  // Get user input
  const cropType = 'Wheat';
  const year = 2022;

  // Get data for the selected crop type
  const data = dataset[cropType];

  // Separate the years and prices into two arrays
  const years = data.map(item => item.year);
  const prices = data.map(item => item.price);
  // console.log(years)
  // console.log(prices)
  // Normalize the data
  const minPrice = tf.min(prices); //minimum price
  const maxPrice = tf.max(prices); //maximum price
  const normalizedPrices = tf.div(tf.sub(prices, minPrice), tf.sub(maxPrice, minPrice));  //making the price between 0 and 1

  // console.log(minPrice)
  // console.log(maxPrice)
  // console.log(normalizedPrices)

  // Create the GAN model
  const generator = tf.sequential({
    layers: [
      tf.layers.dense({ units: 16, inputShape: [1], activation: 'relu' }),
      tf.layers.dense({ units: 16, activation: 'relu' }),
      tf.layers.dense({ units: 1 })
    ]
  });

  const discriminator = tf.sequential({
    layers: [
      tf.layers.dense({ units: 16, inputShape: [1], activation: 'relu' }),
      tf.layers.dense({ units: 16, activation: 'sigmoid' }),
      tf.layers.dense({ units: 1, activation: 'relu' })
    ]
  });

  //console.log(generator)
  //console.log(discriminator)

  const gan = tf.sequential();
  gan.add(generator);
  gan.add(discriminator);

  // Compile the models
  generator.compile({ loss: 'binaryCrossentropy', optimizer: 'adam' });
  discriminator.compile({ loss: 'binaryCrossentropy', optimizer: 'adam' });
  gan.compile({ loss: 'binaryCrossentropy', optimizer: 'adam' });

  // Train the models
  const epochs = 10;
  const batchSize = 64;

  for (let i = 0; i < epochs; i++) {
    //console.log(normalizedPrices.slice(0, -1).dataSync());
    const realPrices = (normalizedPrices.slice(0, -1));
    const realLabels = tf.ones([realPrices.shape[0], 1]);

    const noise = tf.randomNormal([batchSize, 1]);
    const fakePrices = generator.predict(noise);
    const fakeLabels = tf.zeros([fakePrices.shape[0], 1]);

    const dLossReal = await discriminator.trainOnBatch(realPrices, realLabels);
    const dLossFake = await discriminator.trainOnBatch(fakePrices, fakeLabels);
    const dLoss = tf.add(dLossReal, dLossFake).div(2);

    const gLoss = await gan.trainOnBatch(noise, tf.ones([batchSize, 1]));

    console.log(`Epoch ${i}: dLoss=${dLoss.dataSync()}, gLoss=${await gLoss}`);
  }

  // Generate a fake price for the user's input year
  const userYear = tf.tensor2d([[year]]);
  const normalizedUserYear = tf.div(tf.sub(userYear, minPrice), tf.sub(maxPrice, minPrice));
  const fakePrice = generator.predict(normalizedUserYear);
  const denormalizedPrice = tf.mul(tf.add(fakePrice, 1), tf.div(tf.sub(maxPrice, minPrice), 2)).add(minPrice);

  console.log(`The predicted price for ${cropType} in ${year} is ${denormalizedPrice.dataSync()[0]}`);

}

function RNN(req, res, toPredict) //toPredict = price or demand
{

  if (toPredict == "price") {
    // Read the dataset from a JSON file
    const dataset = JSON.parse(fs.readFileSync("./Public/Dataset_Training/dataset_for_price_prediction.json"));

    // Define the input crop type and year
    const inputCropType = req.body.cropType;
    const inputYear = parseInt(req.body.year);

    let y = 2017 //starting prediction year

    yearArray = dataset[inputCropType];

    for (var i = y; i <= inputYear; i++) //for 2017 1 time for 2018 2 times and so on
    {
      let price = (trainPricePredictionusingRNN(yearArray, inputCropType, y))
      yearArray.push({ price: parseFloat(price), year: y })
      y++;
      console.log(yearArray)
    }

    console.log(`The predicted price using RNN of ${inputCropType} for the year ${inputYear} is ${yearArray[yearArray.length - 1].price}.`);
    res.json({ price: yearArray[yearArray.length - 1].price });
  }
  else {
    const dataset = JSON.parse(fs.readFileSync("./Public/Dataset_Training/dataset_for_demand_prediction.json"));

    // Define the input crop type and year
    const inputCropType = req.body.cropType;
    const inputYear = parseInt(req.body.year);
    const Region = req.body.region;

    let y = 2017 //starting prediction year

    yearArray = dataset[Region][inputCropType];

    for (var i = y; i <= inputYear; i++) //for 2017 1 time for 2018 2 times and so on
    {
      let price = (trainDemandPredictionusingRNN(yearArray, inputCropType, y))
      yearArray.push({ demand : parseFloat(price), year: y })
      y++;
      console.log(yearArray)
    }

    console.log(`The predicted demand using RNN of ${Region} , ${inputCropType} for the year ${inputYear} is ${yearArray[yearArray.length - 1].demand}.`);
    res.json({ Demand: yearArray[yearArray.length - 1].demand });
  }
}


function trainPricePredictionusingRNN(yearArray, inputCropType, inputYear) {

  // Find the previous 5 years' prices for the input crop type
  const inputPrices = [];
  for (let i = 1; i <= 5; i++) {
    const price = yearArray.find(crop => crop.year === inputYear - i)?.price;
    inputPrices.unshift(price || 0); // Use 0 if price is not available
  }

  console.log(inputPrices)

  // Normalize the input prices between 0 and 1
  const minPrice = Math.min(...inputPrices);
  const maxPrice = Math.max(...inputPrices);
  const normalizedPrices = inputPrices.map(price => [(price - minPrice) / (maxPrice - minPrice)]);
  // Define the RNN model
  const model = tf.sequential();
  model.add(tf.layers.lstm({ units: 3, inputShape: [5, 1] }));
  model.add(tf.layers.dense({ units: 1 }));

  // Compile the model
  model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });

  // Train the model on the entire dataset for the input crop type
  const trainX = [];
  const trainY = [];

  for (let i = 0; i < yearArray.length - 6; i++) {
    const prices = [];
    for (let j = i; j < i + 5; j++) {
      prices.push([yearArray[j].price]);
    }
    const normalizedPrices = prices.map(price => [(price - minPrice) / (maxPrice - minPrice)]);
    // console.log(normalizedPrices)
    trainX.push(normalizedPrices);
    trainY.push(yearArray[i + 5].price);
  }

  // console.log(trainX)
  // console.log(trainY)
  const xs = tf.tensor3d(trainX);
  const ys = tf.tensor2d(trainY, [trainY.length, 1]);
  model.fit(xs, ys, { epochs: 25 });

  // Use the model to predict the price for the input year
  const inputTensor = tf.tensor3d([normalizedPrices]);
  const predictedPrice = model.predict(inputTensor).dataSync()[0];
  const denormalizedPrice = predictedPrice * (maxPrice - minPrice) + minPrice;
  // console.log(`The predicted price of ${inputCropType} for the year ${inputYear} is ${denormalizedPrice.toFixed(2)}.`);
  console.log(denormalizedPrice.toFixed(2))
  return denormalizedPrice.toFixed(2);
}

function trainDemandPredictionusingRNN(yearArray, inputCropType, inputYear) {

  // Find the previous 5 years' prices for the input crop type
  const inputDemand = [];
  for (let i = 1; i <= 5; i++) {
    const demand = yearArray.find(crop => crop.year === inputYear - i)?.demand;
    inputDemand.unshift(demand || 0); // Use 0 if price is not available
  }

  console.log(inputDemand)

  // Normalize the input prices between 0 and 1
  const minDemand = Math.min(...inputDemand);
  const maxDemand = Math.max(...inputDemand);
  const normalizedDemand = inputDemand.map(demand => [(demand - minDemand) / (maxDemand - minDemand)]);
  // Define the RNN model
  const model = tf.sequential();
  model.add(tf.layers.lstm({ units: 3, inputShape: [5, 1] }));
  model.add(tf.layers.dense({ units: 1 }));

  // Compile the model
  model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });

  // Train the model on the entire dataset for the input crop type
  const trainX = [];
  const trainY = [];

  for (let i = 0; i < yearArray.length - 6; i++) {
    const demands = [];
    for (let j = i; j < i + 5; j++) {
      demands.push([yearArray[j].price]);
    }
    const normalizedDemands = demands.map(demand => [(demand - minDemand) / (maxDemand - minDemand)]);
    // console.log(normalizedPrices)
    trainX.push(normalizedDemands);
    trainY.push(yearArray[i + 5].price);
  }

  // console.log(trainX)
  // console.log(trainY)
  const xs = tf.tensor3d(trainX);
  const ys = tf.tensor2d(trainY, [trainY.length, 1]);
  model.fit(xs, ys, { epochs: 25 });

  // Use the model to predict the price for the input year
  const inputTensor = tf.tensor3d([normalizedDemand]);
  const predictedDemand = model.predict(inputTensor).dataSync()[0];
  const denormalizedDemand = predictedDemand * (maxDemand - minDemand) + minDemand;
  // console.log(`The predicted price of ${inputCropType} for the year ${inputYear} is ${denormalizedPrice.toFixed(2)}.`);
  console.log(denormalizedDemand.toFixed(2))
  return denormalizedDemand.toFixed(2);
}


module.exports = { trainPricePrediction, trainDemandPrediction, RNN };
