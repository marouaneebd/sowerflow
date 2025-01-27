import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// This should be stored in environment variables
const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

// Handle GET requests (for webhook verification)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Check if this is a verification request
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    // Respond with the challenge token from the request
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } else {
    // Respond with '403 Forbidden' if verify tokens do not match
    return new NextResponse('Forbidden', { status: 403 });
  }
}

// Handle POST requests (for webhook events)
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Get the signature from headers
  const signature = request.headers.get('x-hub-signature-256');

  // Verify the signature
  if (!verifySignature(await request.clone().text(), signature)) {
    return new NextResponse('Invalid signature', { status: 403 });
  }

  // Process the webhook event
  try {
    
    // Log the webhook event (you can process it according to your needs)
    console.log('Webhook event:', {
      body
    });

    // Handle different types of events based on the object and entry fields
    // You can add your custom logic here to handle comments, messages, etc.

    // Return a 200 OK response
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Verify the signature from Instagram
function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature || !APP_SECRET) return false;

  const expectedSignature = crypto
    .createHmac('sha256', APP_SECRET)
    .update(payload)
    .digest('hex');

  return `sha256=${expectedSignature}` === signature;
}
