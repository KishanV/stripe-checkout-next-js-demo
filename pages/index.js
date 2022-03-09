import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const { status } = router.query;

  const [loading, setLoading] = useState(false);

  const [item, setItem] = useState({
    image:
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80",
    amount: 0,
  });

  const changeQuantity = (value) => {
    setItem({ ...item, amount: parseFloat(value) || 0 });
  };

  const onInputChange = (e) => {
    changeQuantity(e.target.value);
  };

  const isInt = (n) => {
    return n % 1 === 0;
  };

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = loadStripe(publishableKey);
  const createCheckOutSession = async () => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      const payload = {
        ...item,
        amount: (item.amount + 0.5) * 100,
      };
      const checkoutSession = await axios.post("/api/create-stripe-session", {
        item: payload,
      });
      const result = await stripe.redirectToCheckout({
        sessionId: checkoutSession.data.id,
      });
      if (result.error) {
        alert(result.error.message);
      }
    } catch {}

    setLoading(false);
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>Stripe Checkout with Next.js</title>
        <meta
          name="description"
          content="Complete Step By Step Tutorial for integrating Stripe Checkout with Next.js"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {status && status === "success" && (
          <div className="bg-green-100 text-green-700 p-2 rounded border mb-2 border-green-700">
            Payment Successful
          </div>
        )}
        {status && status === "cancel" && (
          <div className="bg-red-100 text-red-700 p-2 rounded border mb-2 border-red-700">
            Payment Unsuccessful
          </div>
        )}
        <div className="shadow-lg border rounded p-2">
          <Image src={item.image} width={300} height={150} alt={item.name} />
          <p className="text-sm text-gray-600 mt-10">Amount:</p>
          <div className="border rounded">
            <input
              type="number"
              className="p-2 w-full"
              onChange={onInputChange}
              value={item.amount.toString()}
            />
          </div>
          <div className="flex justify-center items-center h-10 mt-5">
            Amount: {item.amount || 0}
          </div>
          <div className="flex justify-center items-center h-10">
            Transfer Fee: 0.5
          </div>
          <div className="flex justify-center items-center h-10 mb-5">
            Total US$ = {item.amount + 0.5 || 0}
          </div>
          <button
            disabled={item.amount <= 0 || loading}
            onClick={createCheckOutSession}
            className="bg-blue-500 hover:bg-blue-600 text-white block w-full py-2 rounded mt-2 disabled:cursor-not-allowed disabled:bg-blue-100"
          >
            {loading ? "Processing..." : "Buy"}
          </button>
        </div>
      </main>
    </div>
  );
}
