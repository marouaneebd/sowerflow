import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth } from '@/lib/auth';
import { SupportTicket } from '@/types/support';

export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);

    const supportRef = adminDb.collection('supports');
    const querySnapshot = await supportRef.where('uuid', '==', uid).orderBy('created_at', 'desc').get();

    const tickets = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error in GET /api/support:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const { subject, description } = await req.json();

    // Validate form data
    if (!subject || !description || typeof subject !== 'string' || typeof description !== 'string') {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    
    const supportTicket: SupportTicket = {
      uuid: uid,
      subject: subject as SupportTicket['subject'],
      description,
      status: 'open',
      created_at: timestamp,
      updated_at: timestamp
    };

    // Create a new document in the support collection
    const docRef = await adminDb.collection('supports').add(supportTicket);

    return NextResponse.json({
      message: 'Support ticket created successfully',
      ticketId: docRef.id,
      timestamp
    });

  } catch (error) {
    console.error('Error in POST /api/support:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 