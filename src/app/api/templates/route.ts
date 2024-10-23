import { NextRequest, NextResponse } from 'next/server';
import { doc, getDocs, setDoc, updateDoc, deleteDoc, query, collection, where } from 'firebase/firestore';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/app/firebase';
import { getServerSession } from 'next-auth/next';


// GET method for fetching the templates based on the user's uid passed in the headers
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions });
    const uid = session?.user?.uid


    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // Reference to the document in the 'templates' collection
    const templatesRef = collection(db, 'templates');
    const q = query(templatesRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const listTemplates = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return NextResponse.json({ listTemplates });
    } else {
      return NextResponse.json({ error: 'No templates for this user' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// PUT method to create a new template with a timestamp as the key
export async function POST(req: NextRequest) {
  try {
    const { title, description, templateContent } = await req.json();
    const session = await getServerSession({ req, ...authOptions });
    const uid = session?.user?.uid

    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // Generate a timestamp to use as the document ID (key)
    const timestamp = new Date().getTime().toString();

    // Create a reference to the new template document under the user's collection
    const docRef = doc(db, 'templates', `${uid}-${timestamp}`);

    // Set the new template object
    await setDoc(docRef, {
      uid,
      title,
      description,
      templateContent,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    return NextResponse.json({ success: true, message: 'Template created successfully' });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

// PUT method to update an existing template
export async function PUT(req: NextRequest) {
  try {
    // Parse the request body
    const { id, title, description, templateContent } = await req.json();
    const session = await getServerSession({ req, ...authOptions });
    const uid = session?.user?.uid

    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Create a reference to the existing template document using the provided ID
    const docRef = doc(db, 'templates', id);

    // Update the existing template document with new data
    await updateDoc(docRef, {
      title,
      description,
      templateContent,
      updatedAt: new Date().getTime().toString(), // Update the timestamp
    });

    return NextResponse.json({ success: true, message: 'Template updated successfully' });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Récupère l'ID du template depuis l'URL
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const docRef = doc(db, 'templates', id);

    await deleteDoc(docRef);

    return NextResponse.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}