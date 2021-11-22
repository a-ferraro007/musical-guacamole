import { getTracks, getPlaylist, addTracks } from "../../../lib/spotify/utils"
import { supabase } from "../../../lib/supabase/client"
import { updateForkedPlaylist } from "../../../lib/supabase/utils"

export default async (req, res) => {
  const { access_token, master_id, id, spotify_id } = req.query
  const masterUriObj = {}
  const forkUriObj = {}

  try {
    const forkedPlaylist = await getPlaylist(access_token, id)
    const forkedReqCount = Math.round(forkedPlaylist.tracks.total / 100 + 0.5)
    const forkedTrackTotal = forkedPlaylist.tracks.total

    const getForkedTracksRes = await getTracks(
      access_token,
      id,
      forkedReqCount,
      forkedTrackTotal
    )
    const forkedUris = getForkedTracksRes.map((item) => {
      forkUriObj[item.track.uri] = true
      return item.track.uri
    })

    const { deletedUris } = await handleGetDeletedUris(
      spotify_id,
      id,
      forkUriObj
    )
    console.log("deleted uris", deletedUris)

    const { error } = updateForkedPlaylist(id, spotify_id, forkedUris)
    if (error) throw error

    const masterPlaylist = await getPlaylist(access_token, master_id)
    const masterReqCount = Math.round(masterPlaylist.tracks.total / 100 + 0.5)
    const masterTrackTotal = masterPlaylist.tracks.total

    const getMasterPlaylistsTracksRes = await getTracks(
      access_token,
      master_id,
      masterReqCount,
      masterTrackTotal
    )
    const masterUris = getMasterPlaylistsTracksRes.map((item) => {
      masterFork[item.track.uri] = true
      return item.track.uri
    })

    handleUpdateFork(masterFork, forkedUris)

    res.status(200).json(deletedUris)
  } catch (error) {
    console.error("error updating fork", error)
    res.status(400)
  }
}

const handleUpdateFork = (master, fork) => {
  const mergedUris = [...master]
  console.log("pre merged", mergedUris)
}

const handleGetDeletedUris = async (spotify_id, playlist_id, spotifyFork) => {
  const deletedUris = {}

  const { data, error } = await supabase
    .from("forked_playlists")
    .select("uris")
    .match({ spotify_id, playlist_id })
    .single()

  data.uris.tracks.forEach((uri) => {
    console.log(uri)
    if (!spotifyFork[uri]) deletedUris[uri] = true
  })

  return {
    deletedUris,
    error,
  }
}
