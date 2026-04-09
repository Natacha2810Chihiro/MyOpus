import { HttpsError, onCall } from "firebase-functions/v2/https";
import Stripe from "stripe";

export const creerAbonnement = onCall(
  { secrets: ["STRIPE_SECRET_KEY"] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Tu dois être connecté pour t'abonner."
      );
    }

    const { priceId, email } = request.data;

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
        success_url: "https://myopus.app/success",
        cancel_url: "https://myopus.app/cancel",
      });

      return { url: session.url };
    } catch (error: any) {
      throw new HttpsError("internal", error.message);
    }
  }
);