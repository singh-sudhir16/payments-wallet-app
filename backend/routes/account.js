// backend/routes/account.js
const express = require('express');
const { authMiddleware } = require('../middleware');
// Import User along with Account and Transaction
const { Account, Transaction, User } = require('../db');
const { default: mongoose } = require('mongoose');

const router = express.Router();

// GET /balance - returns current wallet balance
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json({ balance: account.balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /transactions - returns transaction history for the user
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

// POST /add - add money to the user's account
router.post("/add", authMiddleware, async (req, res) => {
  try {
    let { amount } = req.body;
    amount = Number(amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const account = await Account.findOne({ userId: req.userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Update balance
    account.balance += amount;
    await account.save();

    // Create a transaction record as a credit (deposit)
    await Transaction.create({
      userId: req.userId,
      amount: amount,
      transactionType: "credit",
      counterparty: "", // no counterparty for a deposit
      description: "Money added to wallet"
    });

    res.json({
      message: "Money added successfully",
      newBalance: account.balance
    });
  } catch (error) {
    console.error("Error adding money:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /transfer - transfer funds from sender to recipient
router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    let { amount, to } = req.body;
    amount = Number(amount);

    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Fetch sender's account within the session
    const senderAccount = await Account.findOne({ userId: req.userId }).session(session);
    if (!senderAccount || senderAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Fetch recipient's account within the session
    const recipientAccount = await Account.findOne({ userId: to }).session(session);
    if (!recipientAccount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid account" });
    }
    
    // Retrieve sender and recipient user details for counterparty names
    const senderUser = await User.findById(req.userId).session(session);
    const recipientUser = await User.findById(to).session(session);

    // Update balances
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    // Create two transaction records: one for sender (debit) and one for recipient (credit)
    await Transaction.create([
      {
        userId: req.userId,
        amount: amount, // store absolute amount
        transactionType: "debit",
        counterparty: `${recipientUser.firstName} ${recipientUser.lastName}`,
        description: `Transferred money to ${recipientUser.firstName}`
      },
      {
        userId: to,
        amount: amount,
        transactionType: "credit",
        counterparty: `${senderUser.firstName} ${senderUser.lastName}`,
        description: `Received money from ${senderUser.firstName}`
      }
    ], { session });

    await session.commitTransaction();
    res.json({ message: "Transfer successful" });
  } catch (error) {
    console.error("Error during transfer:", error);
    await session.abortTransaction();
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    session.endSession();
  }
});

module.exports = router;
