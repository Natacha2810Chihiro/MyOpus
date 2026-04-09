import { HttpsError, onCall } from "firebase-functions/v2/https";
import Stripe from "stripe";

export const creerAbonnement = onCall(
  { 
    secrets: ["STRIPE_SECRET_KEY"],
    invoker: "public"
  },
  async (request) => {
    const { priceId, email } = request.data;

    if (!email || !priceId) {
      throw new HttpsError("invalid-argument", "Email et priceId requis.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2026-03-25.dahlia" as any,
    });

    try {
      const customer = await stripe.customers.create({ email });
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: "exp://10.33.166.49:8082/--/abonnement-success",
        cancel_url: "exp://10.33.166.49:8082/--/abonnement-cancel",
      });
      return { url: session.url };
    } catch (error: any) {
      throw new HttpsError("internal", error.message);
    }
  }
);