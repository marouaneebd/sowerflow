import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuth } from '@/lib/auth'
import { InstagramProfile, Profile } from '@/types/profile'

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
    const profileRef = adminDb.collection('profiles').doc(uid)
    const profileData = await profileRef.get();

    if (profileData.exists) {
      const profile: Profile = profileData.data() as Profile;
      if (profile.instagram && profile.instagram.access_token && profile.instagram.token_expires) {
        const token_expires = new Date(profile.instagram.token_expires)
        const now = new Date()

        // If token expires in less than 24 hours, refresh it
        if (token_expires < new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
          try {
            const { access_token, expires_in } = await refreshInstagramToken(
              profile.instagram.access_token
            )

            await profileRef.update({
              instagram: {
                ...profile.instagram,
                access_token: access_token,
                token_expires: new Date(Date.now() + expires_in * 1000).toISOString(),
                updated_at: new Date().toISOString()
              }
            })

            return NextResponse.json({
              success: true,
              username: profile.instagram.username,
              userId: profile.instagram.userId
            })
          } catch (error) {
            console.error('Error refreshing token:', error)
            // Continue with new authentication if refresh fails
          }
        } else {
          // Token is still valid
          return NextResponse.json({
            success: true,
            username: profile.instagram.username,
            userId: profile.instagram.userId,
          })
        }
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

    const instagramUserData = await userResponse.json()

    // Get long-lived access token
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_CLIENT_SECRET}&access_token=${access_token}`
    )

    const { access_token: longLivedToken, expires_in } = await longLivedTokenResponse.json()

    // Enable webhook subscriptions
    const webhookSubscriptionResponse = await fetch(
      `https://graph.instagram.com/me/subscribed_apps?subscribed_fields=comments,messages,message_reactions,messaging_referral,messaging_optins,messaging_postbacks,messaging_seen,live_comments&access_token=${longLivedToken}`,
      {
        method: 'POST',
      }
    )

    if (!webhookSubscriptionResponse.ok) {
      console.error('Failed to enable webhook subscriptions:', await webhookSubscriptionResponse.text())
      // Continue with the flow even if webhook subscription fails
    }

    // Store Instagram data in user's profile
    const instagramData: InstagramProfile = {
      username: instagramUserData.username,
      userId: instagramUserData.user_id,
      biography: instagramUserData.biography,
      permissions: permissions,
      access_token: longLivedToken,
      token_expires: new Date(Date.now() + expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString()
    };

    await profileRef.update({
      instagram: instagramData
    });

    return NextResponse.json({
      success: true,
      username: instagramUserData.username,
      userId: instagramUserData.user_id,
      permissions: permissions,
      biography: instagramUserData.biography,
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