/* eslint-disable no-unused-vars */
const tf = require("@tensorflow/tfjs-node");

// Import the MongoDB models
const Customer = require("../models/customerModel");
const BusinessOwner = require("../models/businessOwnerModel");

// Step 1: Prepare the data
async function prepareData() {
  try {
    // Fetch user-item interactions
    const customers = await Customer.find().populate("reviews.businessId");
    const businessOwners = await BusinessOwner.find().populate("reviews.customerId");

    // Extract user-item interactions
    const userItemInteractions = [];

    // Extract interactions from customers
    customers.forEach((customer) => {
      customer.reviews.forEach((review) => {
        if (review.businessId && review.businessId._id) {
          userItemInteractions.push({
            userId: customer.userId,
            itemId: review.businessId._id,
            rating: review.starRating,
          });
        }
      });
    });

    // Extract interactions from business owners
    businessOwners.forEach((businessOwner) => {
      businessOwner.reviews.forEach((review) => {
        if (review.customerId && review.customerId._id) {
          userItemInteractions.push({
            userId: review.customerId._id,
            itemId: businessOwner._id,
            rating: review.starRating,
          });
        }
      });
    });

    // Shuffle the interactions
    tf.util.shuffle(userItemInteractions);

    // Split the data into training and testing sets (80-20 split)
    const trainSize = Math.floor(0.8 * userItemInteractions.length);
    const trainData = userItemInteractions.slice(0, trainSize);
    const testData = userItemInteractions.slice(trainSize);

    return { trainData, testData };
  } catch (error) {
    console.error("Error preparing data:", error);
    throw error; // Ensure the error is propagated
  }
}

// Step 2: Define TensorFlow.js model
function buildModel(numUsers, numItems, embeddingDim) {
  const inputUser = tf.input({ shape: [1] });
  const inputItem = tf.input({ shape: [1] });
  const userEmbedding = tf.layers
    .embedding({ inputDim: numUsers, outputDim: embeddingDim })
    .apply(inputUser);
  const itemEmbedding = tf.layers
    .embedding({ inputDim: numItems, outputDim: embeddingDim })
    .apply(inputItem);
  const dotProduct = tf.layers
    .dot({ axes: 1 })
    .apply([userEmbedding, itemEmbedding]);
  const output = tf.layers
    .activation({ activation: "sigmoid" })
    .apply(dotProduct);

  const model = tf.model({ inputs: [inputUser, inputItem], outputs: output });
  model.compile({ optimizer: "adam", loss: "meanSquaredError" });

  return model;
}

// Step 3: Train the model
async function trainModel(trainData, numUsers, numItems, embeddingDim, epochs) {
  try {
    const model = buildModel(numUsers, numItems, embeddingDim);
    
    // Ensure trainData is not undefined
    if (!trainData) {
      throw new Error("Training data is undefined");
    }

    const { trainData: xTrain, testData: xTest } = trainData;

    // Ensure xTrain is not undefined
    if (!xTrain) {
      throw new Error("Training data is undefined");
    }

    const userIds = xTrain.map((interaction) => interaction.userId);
    const itemIds = xTrain.map((interaction) => interaction.itemId);
    const ratings = xTrain.map((interaction) => interaction.rating);

    const xTrainTensors = [
      tf.tensor(userIds, [userIds.length, 1]),
      tf.tensor(itemIds, [itemIds.length, 1]),
    ];

    const yTrainTensor = tf.tensor(ratings, [ratings.length, 1]);

    const history = await model.fit(xTrainTensors, yTrainTensor, {
      epochs,
      validationSplit: 0.2,
    });

    return { model, history };
  } catch (error) {
    console.error("Error training model:", error);
    throw error; // Ensure the error is propagated
  }
}


// Step 4: Make recommendations
async function makeRecommendations(model, userId, numItems, businessOwners) {
  try {
    const itemIds = businessOwners.map((business) => business._id);
    const userIdTensor = tf.tensor([[userId]]);
    const itemIdsTensor = tf.tensor(itemIds.map((id) => [id]));

    const predictions = model.predict([userIdTensor, itemIdsTensor]);

    const recommendations = [];

    predictions
      .squeeze()
      .arraySync()
      .forEach((prediction, index) => {
        recommendations.push({ itemId: itemIds[index], prediction });
      });

    recommendations.sort((a, b) => b.prediction - a.prediction);

    return recommendations;
  } catch (error) {
    console.error("Error making recommendations:", error);
  }
}
module.exports = {
  prepareData,
  trainModel,
  buildModel,
  makeRecommendations
};