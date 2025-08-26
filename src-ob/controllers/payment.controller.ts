import Stripe from 'stripe';
import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import { createScheduleFromStripe, getSlotDetails} from '../services/payment.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});


export async function stripeWebhook(req: Request, res: Response): Promise<any> {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle payment completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata!;
    await createScheduleFromStripe({
      user_id: metadata.user_id,
      professional_id: metadata.professional_id,
      start_time: metadata.start_time,
      end_time: metadata.end_time,
      status: 'confirmed',
    });
  }

  res.status(200).json({ received: true });
}

// export async function createCheckoutSession(req: Request, res: Response): Promise<any> {
//   const { professional_id, price, currency, start_time, end_time } = req.body;

//   if (!professional_id || !price || !currency) {
//     return res.status(400).json({
//       success: false,
//       message: 'professional_id, price, and currency are required',
//     });
//   }

//   try {
//     // 1. Create the Stripe Checkout Session with provided price
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [{
//         price_data: {
//           currency: currency,
//           product_data: { name: '1:1 Session' },
//           unit_amount: Math.round(parseFloat(price) * 100),
//         },
//         quantity: 1,
//       }],
//       mode: 'payment',
//       success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_URL}/cancel`,
//       metadata: {
//         user_id: req.user!.id,
//         professional_id,
//         start_time,
//         end_time,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Session created',
//       data: { url: session.url },
//     });
//   } catch (error: any) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || 'An unexpected error occurred while creating the session.',
//       error: error.message,
//     });
//   }
// }
export async function createCheckoutSession(req: Request, res: Response): Promise<any> {
  const { professional_id, price, currency, start_time, end_time } = req.body;

  if (!professional_id || !price || !currency) {
    return res.status(400).json({
      success: false,
      message: 'professional_id, price, and currency are required',
    });
  }

  try {
    // 1. Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(price) * 100), // amount in cents
      currency: currency,
      automatic_payment_methods: { enabled: true }, // lets Stripe handle cards, wallets, etc.
      metadata: {
        user_id: req.user!.id,
        professional_id,
        start_time,
        end_time,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'PaymentIntent created',
      data: {
        clientSecret: paymentIntent.client_secret, // <-- needed for PaymentSheet
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred while creating the PaymentIntent.',
      error: error.message,
    });
  }
}
