const { TonClient, WalletContractV4 } = require("ton");
const { Address, beginCell, toNano } = require("ton-core");

(async () => {
    // Initialize TON client (use testnet or mainnet endpoint)
    const client = new TonClient({ endpoint: "https://toncenter.com/api/v2/jsonRPC" });

    // Wallet details
    const walletAddress = Address.parse("YOUR_WALLET_ADDRESS"); // Your wallet address
    const walletSecretKey = "YOUR_PRIVATE_KEY"; // Your wallet's private key
    const jettonWalletAddress = Address.parse("JETTON_WALLET_ADDRESS"); // Sender's Jetton wallet address

    // Recipient's details
    const recipientAddress = Address.parse("RECIPIENT_WALLET_ADDRESS");
    const amount = 1000 * 10 ** 9; // Convert to smallest unit (nanoJettons)

    // Construct transfer payload for Jetton wallet
    const payload = beginCell()
        .storeUint(0xf8a7ea5, 32) // Function ID for 'transfer' method
        .storeUint(0, 64)         // Transaction ID (set to 0 or unique ID)
        .storeCoins(amount)       // Amount to transfer
        .storeAddress(recipientAddress) // Recipient address
        .storeAddress(null)       // Forward payload destination (optional)
        .storeBit(0)              // Custom payload flag
        .endCell();

    // Create Wallet Contract
    const wallet = WalletContractV4.create({ workchain: 0, address: walletAddress, publicKey: null });

    // Send Jetton transfer transaction
    const seqno = await wallet.getSeqNo(client);
    const transfer = wallet.createTransfer({
        seqno,
        secretKey: walletSecretKey,
        messages: [
            {
                to: jettonWalletAddress, // Send to your Jetton Wallet contract
                value: toNano("0.05"),  // TON for gas fees
                body: payload,
            },
        ],
    });

    await client.sendExternalMessage(wallet, transfer);
    console.log("Jetton transfer initiated successfully.");
})();l
