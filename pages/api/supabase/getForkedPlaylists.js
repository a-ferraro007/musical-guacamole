import { supabase } from "../../../lib/supabase/client"

export default async (req, res) => {
  const { id } = req.query
  console.log(id)
  try {
    const { data, error } = await supabase
      .from("forked_playlists")
      .select("playlist_id, master_playlist_id, playlist")
      .eq("spotify_id", id)

    console.log(data)
    if (error) throw error

    res.status(200).json(data)
  } catch (error) {
    console.error(error)
    res.status(400).json(error)
  }
}
