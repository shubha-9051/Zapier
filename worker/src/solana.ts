import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  PublicKey,
  sendAndConfirmTransaction,
  Connection,
} from "@solana/web3.js";
import base58 from "bs58";

const connection = new Connection(
  "https://solana-devnet.g.alchemy.com/v2/xJ8rGKtDjrG9to_wX1KxuUq6nLgqin2G",
  "finalized"
);

export async function sendSol(to: string, amount: string) {
  try {
      const keypair = Keypair.fromSecretKey(base58.decode(process.env.SOL_PRIVATE_KEY ?? ""));
      console.log("Sender public key:", keypair.publicKey.toBase58());

      const recipient = new PublicKey(to);
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

      if (isNaN(lamports) || lamports <= 0) {
          throw new Error("Invalid amount specified");
      }

      // Fetch the latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      // Create the transaction with the latest blockhash
      const transferTransaction = new Transaction({
          recentBlockhash: blockhash,
          feePayer: keypair.publicKey,
      }).add(
          SystemProgram.transfer({
              fromPubkey: keypair.publicKey,
              toPubkey: recipient,
              lamports,
          })
      );

      // Send and confirm the transaction
      const signature = await sendAndConfirmTransaction(connection, transferTransaction, [keypair], {
          preflightCommitment: "processed",
      });

      console.log("SOL Sent! Transaction Signature:", signature);

      // Explicit confirmation with block height
      const status = await connection.confirmTransaction(
          { signature, lastValidBlockHeight, blockhash },
          "finalized"
      );
      console.log("Transaction finalized:", status);
  } catch (error) {
    //@ts-ignore
      console.error("Transaction failed:", error.message || error);
  }
}
