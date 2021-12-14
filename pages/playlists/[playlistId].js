import { useEffect, useState } from "react"
import TrackList from "../../components/TrackList"
import Layout from "../../components/Layout"
import { useAuth } from "../../context/auth"
import { usePlaylist } from "../../context/playlist"
import styles from "../.././styles/Playlist.module.css"
import Image from "next/image"
import ForkIcon from "../../components/SVG/ForkIcon"
import Loading from "../../components/SVG/Loading"
import { getCookie } from "../../lib/getCookie"
import { useRouter } from "next/router"

//export async function getServerSideProps(context) {
//  console.log("context", context)
//  return {
//    props: {}, // will be passed to the page component as props
//  }
//}

const playlists = () => {
  const {
    playlist,
    radioBtnState,
    masterId,
    mood,
    handleSetMasterId,
    handleSetPlaylist,
    handleSetRadioBtn,
    handleSetMood,
  } = usePlaylist()
  const [tracks, setTracks] = useState([])
  const { session, user, getNewAuthTokens } = useAuth()
  const [isCreatingFork, setIsCreatingFork] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  //const [bgColor, setBgColor] = useState("rgb(80, 56, 160)")
  const router = useRouter()
  //
  useEffect(() => {
    handleSetMood("rgb(80, 56, 160)")
  }, [])
  useEffect(() => {
    const token = getCookie("refresh_token")
    if (token) {
      ;(async () => {
        try {
          await getNewAuthTokens(token)
        } catch (error) {
          console.log("error generating new auth token", error)
          router.replace("/")
        }
      })()
      //setRefreshToken(token)
    } else {
      router.replace("/")
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!session) return
      if (!playlist.playlistId) {
        const { playlistId } = router.query
        const getPlaylistRes = await fetch(
          `/api/spotify/getPlaylist?playlist_id=${playlistId}&access_token=${session.access_token}`
        )

        const playlistObj = await getPlaylistRes.json()
        const playlist = {
          name: playlistObj.name,
          playlistId: playlistObj.id,
          trackCount: playlistObj.tracks,
          trackTotal: playlistObj.tracks.total,
          reqCount: Math.round(playlistObj.tracks.total / 100 + 0.5),
          owner: playlistObj.owner,
          image: playlistObj?.images[0]?.url,
          description: playlistObj.description,
        }
        handleSetPlaylist(playlist)
      }
    })()
  }, [session])

  useEffect(() => {
    ;(async () => {
      if (!session || !user) return
      try {
        setIsLoading(true)
        const tracks = await fetch(
          `/api/spotify/getTracksList?id=${playlist.playlistId}&access_token=${session.access_token}&total=${playlist.trackTotal}&reqCount=${playlist.reqCount}`
        )
        const tracksRes = await tracks.json()
        const trackItems = tracksRes.tracks?.map((item) => {
          return item.track
        })
        setIsLoading(false)
        setTracks([...trackItems])
      } catch (error) {
        console.error(error)
      }
    })()
  }, [session, playlist])

  const handleOnClick = async () => {
    if (playlist.isFork) {
      await handleUpdateForkedPlaylist()
    } else {
      await handleCreateFork()
    }
  }

  const handleCreateFork = async () => {
    setIsCreatingFork(true)
    try {
      const forkPlaylist = await fetch(`/api/spotify/forkPlaylist`, {
        method: "POST",
        body: JSON.stringify({
          access_token: session.access_token,
          user: user.id,
          name: playlist.name,
          reqCount: playlist.reqCount,
          owner: playlist.owner.display_name,
          master_playlist_id: playlist.playlistId,
          total: playlist.trackTotal,
          image: playlist.image,
        }),
      })
      const fork = await forkPlaylist.json()
      console.log(fork)
      fork[0].playlist.isFork = true
      handleSetMasterId(fork[0].master_playlist_id)
      handleSetPlaylist(fork[0].playlist)
      handleSetRadioBtn("forked")
      setIsCreatingFork(false)
      router.replace(`/playlists/${fork[0].playlist_id}`)
    } catch (error) {
      console.error(error)
      setIsCreatingFork(false)
    }
  }

  const handleUpdateForkedPlaylist = async () => {
    try {
      await fetch(
        `/api/spotify/updateForkedPlaylist?access_token=${session.access_token}&id=${playlist.playlistId}&master_id=${masterId}&spotify_id=${user.id}`
      )
    } catch (error) {
      console.error(error)
    }
  }

  //There's no such thing as deleting a playlist in spotify
  //need to figure out how they do it.

  //const handleDeletePlaylist = async () => {
  //  console.log(playlist)
  //  try {
  //    const data = await fetch(
  //      `/api/spotify/deletePlaylist?access_token=${session.access_token}&playlist_id=${playlist.playlistId}&master_id=${masterId}&spotify_id=${user.id}&isFork=${playlist.isFork}`
  //    )
  //    console.log(data)
  //    router.replace("/")
  //  } catch (error) {
  //    console.error
  //  }
  //}

  if (!playlist) return <> </>
  return (
    <>
      <Layout>
        {!isCreatingFork ? (
          <div className={styles.playlist__container}>
            <div className={styles.playlist__headerContainer}>
              <div
                className={styles.playlist__headerBgColor}
                style={{ backgroundColor: mood }}
              >
                {" "}
              </div>
              <div className={styles.playlist__headerBg}></div>
              <div className={styles.playlist__imageContainer}>
                <Image
                  src={playlist.image ? playlist.image : "/placeholder.png"}
                  width="250"
                  height="250"
                  layout="fixed"
                  className={styles.playlist__image}
                />
              </div>

              <div style={{ zIndex: "10", alignSelf: "end" }}>
                <span
                  className={styles.playlist__subscript}
                  style={{ color: "var(--primary-text-green)" }}
                >
                  {playlist.isFork ? "FORK" : "LIKED"}
                </span>
                <h1 className={styles.playlist__heading}> {playlist.name} </h1>
                <p className={styles.playlist__description}>
                  {playlist.description}
                </p>
                <div className={styles.playlist__btnBar}>
                  <div className={styles.playlist__subscriptContainer}>
                    <span className={styles.playlist__subscript}>
                      {" "}
                      {playlist.owner?.display_name}
                    </span>
                    <span className={styles.playlist__subscript}>
                      {" "}
                      {playlist.trackTotal} songs
                    </span>
                  </div>

                  {playlist.isFork ? (
                    <button onClick={handleOnClick} className={styles.btn}>
                      <div className={styles.fork__btnIcon}>
                        <ForkIcon />
                      </div>
                      <span className={styles.fork__btnText}> update </span>
                    </button>
                  ) : (
                    <button onClick={handleOnClick} className={styles.btn}>
                      <div className={styles.fork__btnIcon}>
                        <ForkIcon />
                      </div>
                      <span className={styles.fork__btnText}> fork </span>
                    </button>
                  )}
                  {/*<button
                    style={{ color: "#fff" }}
                    onClick={handleDeletePlaylist}
                  >
                    delete
                  </button>*/}
                </div>{" "}
              </div>
            </div>

            <div
              className={styles.playlist__tracksContainer}
              style={{ position: "relative" }}
            >
              <div
                className={styles.playlist__headerBgColorBot}
                style={{ backgroundColor: mood }}
              >
                {" "}
              </div>
              <div className={styles.playlist__headerBgBot}></div>
              {(!tracks.length && isLoading) || !tracks.length ? (
                <Loading width={50} height={50} />
              ) : (
                <TrackList tracks={tracks} />
              )}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.creating__fork}>
              {" "}
              <Loading width={50} height={50} />
              <span className={styles.creating__forkHeading}>
                forking:{" "}
                <span style={{ color: "rgba(255,255,255,1)" }}>
                  {" "}
                  {playlist.name}{" "}
                </span>
              </span>{" "}
              <span style={{ color: "rgba(255,255,255,.7)", fontSize: "14px" }}>
                {" "}
                this may take a minute
              </span>
            </div>
          </>
        )}
      </Layout>
    </>
  )
}

export default playlists
