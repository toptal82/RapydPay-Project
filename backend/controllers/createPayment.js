const request = require("request-promise");
const CryptoJS = require("crypto-js");
const Payment = require("../models/Payment");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");

const { getHeaders, getRequestData, getHelpers } = require("../functions");

const helpers = getHelpers();

module.exports = async function (req, res) {
  const { amount, customer, ewallet } = req.body;
  const body = {
    amount: amount,
    currency: "USD",
    payment_method: "",
    customer: customer,
    description: "Payment by customer's default payment method",
    ewallets: [
      {
        ewallet: ewallet,
        percentage: 100,
      },
    ],
  };

  // Request Data Parameters
  const uri = "https://sandboxapi.rapyd.net/v1/payments";
  const http_method = "post";
  const path = "/v1/payments";

  const bodyString = JSON.stringify(body);

  const toSign =
    http_method +
    path +
    helpers.salt +
    helpers.timestamp +
    helpers.access_key +
    helpers.secret_key +
    bodyString;
  const signature = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(toSign, helpers.secret_key)
  );

  // Request Details
  const headers = getHeaders(
    helpers.access_key,
    signature,
    helpers.salt,
    helpers.timestamp
  );
  const requestData = getRequestData(headers, uri, http_method, bodyString);

  // Getting The Current Date
  const dateTime = new Date().toISOString();

  try {
    const response = await request(requestData);

    const parsedResponse = JSON.parse(response);

    // Save Payment
    const newPayment = new Payment({
      paymentId: parsedResponse.data.id,
      customerId: customer,
      amount: parsedResponse.data.amount,
      ewallet_id: ewallet,
      created_at: dateTime,
    });
    await newPayment.save();

    // Save Transaction
    const newTransaction = new Transaction({
      transactionId: parsedResponse.data.id,
      amount: parsedResponse.data.amount,
      destination_phone_number: "",
      destination_ewallet_id: ewallet,
      source_ewallet_id: customer,
      created_at: dateTime,
    });
    await newTransaction.save();

    // Update the balance of the wallet to which the amount is transferred
    const destinationWalletDetails = await Wallet.findOne({
      ewallet_id: ewallet.toString(),
    });
    await Wallet.updateOne(
      { _id: destinationWalletDetails._id },
      { balance: destinationWalletDetails.balance + parseInt(amount) }
    );

    console.log(newPayment + "Added");
    res.send("Payment Done !!!!");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
