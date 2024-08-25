import {
  ACTIONS_CORS_HEADERS, // Importing CORS headers for actions
  ActionGetResponse, // Type for GET response
  ActionPostRequest, // Type for POST request
  ActionPostResponse, // Type for POST response
  createPostResponse, // Function to create a POST response
} from "@solana/actions";

import {
  Connection, // Class for Solana network connection
  LAMPORTS_PER_SOL, // Constant for lamports to SOL conversion
  PublicKey, // Class for handling public keys
  SystemProgram, // System program for basic transactions
  Transaction, // Class for creating transactions
  clusterApiUrl, // Function to get cluster API URL
} from "@solana/web3.js";

// Define the constant URL
const BASE_URL = "https://blinks-checking.vercel.app/";

export async function GET(request: Request) {
  const url = new URL(BASE_URL); // Use the hardcoded URL instead of request.url
  const payload: ActionGetResponse = {
    // Define the GET response payload
    icon: "https://ichef.bbci.co.uk/news/1024/cpsprodpb/FC92/production/_115785646_hitler_councilor.jpg.webp", // Icon URL
    title: "Donate To Get Black PP Small", // Title
    description: "Support Hitler by donating SOL.", // Description
    label: "Donate", // Label for the action
    links: {
      actions: [
        {
          label: "Donate 0.1 SOL", // Action label
          href: `${url.href}?amount=0.1`, // Action URL with amount parameter
        },
      ],
    },
  };
  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS, // Set CORS headers
  });
}

export async function POST(request: Request) {
  let body: ActionPostRequest;

  try {
    // Try parsing the request body as JSON
    body = await request.json();
    console.log('Request body:', body); // Log the body to debug
  } catch (error) {
    console.error('Error parsing request body:', error);
    return Response.json(
      {
        error: {
          message: "Invalid request body format", // More specific error message
        },
      },
      {
        status: 400, // Bad request status
        headers: ACTIONS_CORS_HEADERS,
      }
    );
  }

  const url = new URL(BASE_URL); // Use the hardcoded URL instead of request.url
  const amount = Number(url.searchParams.get("amount")) || 0.1; // Get the amount from query params or default to 0.1
  let sender;

  try {
    sender = new PublicKey(body.account); // Parse the sender public key
  } catch (error) {
    console.error('Invalid account error:', error); // Log the error for more details
    return Response.json(
      {
        error: {
          message: "Invalid account", // Return error if invalid account
        },
      },
      {
        status: 400, // Bad request status
        headers: ACTIONS_CORS_HEADERS,
      }
    );
  }

  try {
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed"); // Create a connection to the mainnet-beta cluster

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender, // Sender public key
        toPubkey: new PublicKey("address"), // Recipient public key
        lamports: amount * LAMPORTS_PER_SOL, // Amount to transfer in lamports
      })
    );

    transaction.feePayer = sender; // Set the fee payer
    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash; // Get the latest blockhash
    transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight; // Get the last valid block height

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction, // Add the transaction to the response payload
        message: "Transaction created", // Success message
      },
    });
    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });

  } catch (error) {
    console.error('Error creating transaction or fetching blockhash:', error);
    return Response.json(
      {
        error: {
          message: "Failed to create transaction", // Error message if transaction creation fails
        },
      },
      {
        status: 500, // Internal server error status
        headers: ACTIONS_CORS_HEADERS,
      }
    );
  }
}
