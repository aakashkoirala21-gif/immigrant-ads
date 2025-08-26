import Stripe from 'stripe';
import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import { createScheduleFromStripe, getSlotDetails} from '../services/payment.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
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

export async function createCheckoutSession(req: Request, res: Response): Promise<any> {
  const { professional_id, start_time, end_time } = req.body;

  try {
    // 1. Fetch the correct price and currency from the database
    const slotDetails = await getSlotDetails(professional_id, start_time);

    if (!slotDetails) {
      return res.status(404).json({
        success: false,
        message: 'Invalid slot or pricing not found for this time.',
      });
    }

    const { price, currency } = slotDetails;

    // 2. Create the Stripe Session with server-side fetched data
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: { name: '1:1 Session' },
          unit_amount: Math.round(parseFloat(price) * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        user_id: req.user!.id,
        professional_id,
        start_time,
        end_time,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Session created',
      data: { url: session.url },
    });
  } catch (error: any) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred while creating the session.',
      error: error.message
    });
  }
}