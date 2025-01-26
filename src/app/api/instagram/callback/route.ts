import { NextResponse } from 'next/server'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/app/firebase'
import { verifyAuth } from '@/lib/auth'

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI

export async function POST(request: Request) {
  try {
    // Verify user authentication
    const { uid } = await verifyAuth(request)
    const { code } = await request.json()

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: INSTAGRAM_CLIENT_ID!,
        client_secret: INSTAGRAM_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI!,
        code,
      }),
    })

    const { access_token } = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`
    )

    const userData = await userResponse.json()

    // Get long-lived access token
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_CLIENT_SECRET}&access_token=${access_token}`
    )

    const { access_token: longLivedToken, expires_in } = await longLivedTokenResponse.json()

    // Store Instagram data in user's profile
    const userDocRef = doc(db, 'profiles', uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      )
    }

    await updateDoc(userDocRef, {
      instagram: {
        username: userData.username,
        userId: userData.id,
        accessToken: longLivedToken,
        tokenExpires: new Date(Date.now() + expires_in * 1000).toISOString(),
        lastUpdated: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      username: userData.username,
      userId: userData.id,
    })
  } catch (error) {
    console.error('Instagram OAuth Error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to authenticate with Instagram' },
      { status: 500 }
    )
  }
} 