import { NextResponse } from 'next/server'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/app/firebase'
import { verifyAuth } from '@/lib/auth'
import { ProfileData, InstagramProfile } from '@/types/profile'

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI

// Add a new function to refresh the token
async function refreshInstagramToken(oldToken: string) {
  try {
    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${oldToken}`
    )
    const data = await response.json()
    return {
      access_token: data.access_token,
      expires_in: data.expires_in
    }
  } catch (error) {
    console.error('Error refreshing Instagram token:', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    // Verify user authentication
    const { uid } = await verifyAuth(request)
    const { code } = await request.json()

    // Check if user already has a token that needs refresh
    const userDocRef = doc(db, 'profiles', uid)
    const userDoc = await getDoc(userDocRef)
    
    if (userDoc.exists() && userDoc.data().instagram?.accessToken) {
      const tokenExpires = new Date(userDoc.data().instagram.tokenExpires)
      const now = new Date()
      
      // If token expires in less than 24 hours, refresh it
      if (tokenExpires < new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
        try {
          const { access_token, expires_in } = await refreshInstagramToken(
            userDoc.data().instagram.accessToken
          )
          
          await updateDoc(userDocRef, {
            instagram: {
              ...userDoc.data().instagram,
              accessToken: access_token,
              tokenExpires: new Date(Date.now() + expires_in * 1000).toISOString(),
              lastUpdated: new Date().toISOString()
            }
          })
          
          return NextResponse.json({
            success: true,
            username: userDoc.data().instagram.username,
            userId: userDoc.data().instagram.userId
          })
        } catch (error) {
          console.error('Error refreshing token:', error)
          // Continue with new authentication if refresh fails
        }
      } else {
        // Token is still valid
        return NextResponse.json({
          success: true,
          username: userDoc.data().instagram.username,
          userId: userDoc.data().instagram.userId,
        })
      }
    }

    // Proceed with new authentication if no valid token exists
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

    const { access_token, permissions } = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=user_id,username,biography&access_token=${access_token}`
    )

    const userData = await userResponse.json()

    // Get long-lived access token
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_CLIENT_SECRET}&access_token=${access_token}`
    )

    const { access_token: longLivedToken, expires_in } = await longLivedTokenResponse.json()

    // Store Instagram data in user's profile
    const instagramData: InstagramProfile = {
      username: userData.username,
      userId: userData.user_id,
      biography: userData.biography,
      permissions: permissions,
      accessToken: longLivedToken,
      tokenExpires: new Date(Date.now() + expires_in * 1000).toISOString(),
      lastUpdated: new Date().toISOString()
    };

    await updateDoc(userDocRef, {
      instagram: instagramData
    });

    return NextResponse.json({
      success: true,
      username: userData.username,
      userId: userData.user_id,
      permissions: permissions,
      biography: userData.biography,
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