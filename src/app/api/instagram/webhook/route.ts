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
  // Get the raw body text first
  const rawBody = await request.text();
  
  // Get the signature from headers
  const signature = request.headers.get('x-hub-signature-256');

  // Verify the signature
  if (!verifySignature(rawBody, signature)) {
    return new NextResponse('Invalid signature', { status: 403 });
  }

  // Process the webhook event
  try {
    // Parse the JSON after verification
    //const body = JSON.parse(rawBody);
    
    // Log the webhook event
    console.log('Webhook event:', {
      rawBody
    });

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
