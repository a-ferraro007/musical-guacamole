import { NextResponse } from "next/server"
import { getNewAccessToken } from "../lib/spotify/utils"

export async function middleware(req, ev) {
  const next = NextResponse.next()
  const { user, access_token, refresh_token } = req.cookies

  if (
    req.url !== "/" &&
    req.url !== "/collection/playlists" &&
    !req.url.includes("/playlists/")
  ) {
    return next
  }

  if (!user || !refresh_token) {
    return NextResponse.redirect("/login")
  }

  console.log("MIDDLEWARE RUN")

  try {
    if (access_token) {
      //using the get user route to verify the access token is still valid
      const userReq = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      const data = await userReq.json()
      if (data.error && data.error?.status !== 401) {
        // errors that arent from an invalid token throw and redirect to login page
        throw new Error(data.error.message)
      } else if (data.error) {
        const { access_token, expires_in } = await getNewAccessToken(
          refresh_token
        )
        next.cookie("access_token", access_token)
      }
    }

    if (!access_token) {
      const { access_token, expires_in } = await getNewAccessToken(
        refresh_token
      )
      next.cookie("access_token", access_token)
    }
  } catch (error) {
    console.error(error)
    return NextResponse.redirect("/login")
  }
  return next
}
