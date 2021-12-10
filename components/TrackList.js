import { useState } from "react"
import styles from ".././styles/TrackInfo.module.css"
import Image from "next/image"

const TrackList = ({ tracks }) => {
  const [isSelected, setIsSelected] = useState(null)
  console.log(tracks[4])
  const returnTime = (ms) => {
    const rd = Math.round(100 * (ms / 1000 / 60)) / 100
    const wh = Math.floor(rd) + ""
    const th = Math.round(100 * (rd - Math.floor(rd))) + ""
    return wh + ":" + th
  }

  const select = (index) => {
    if (index === isSelected) {
      setIsSelected(null)
      return
    }
    setIsSelected(index)
  }
  return (
    <div className={styles.tracklist__container}>
      <div
        className={styles.tracklist__grid__header}
        style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
      >
        <span
          className={`${styles.tracklist__cell} ${styles.tracklist__cellHeader}`}
        >
          #
        </span>
        <span
          className={`${styles.tracklist__cell} ${styles.tracklist__cellHeader}`}
        >
          Title
        </span>
        <span
          className={`${styles.tracklist__cell} ${styles.tracklist__cellHeader}`}
        >
          Album
        </span>
        <span
          className={`${styles.tracklist__cell} ${styles.tracklist__cellHeader}`}
        >
          Date Added
        </span>
        <span
          className={`${styles.tracklist__cell} ${styles.tracklist__cellHeader}`}
          style={{ justifySelf: "end" }}
        >
          Time
        </span>
      </div>

      {tracks.map((track, index) => {
        return (
          <div
            className={`${styles.tracklist__grid} ${
              isSelected === index ? styles.tracklist__grid__selected : ""
            }`}
            key={index}
            onClick={() => select(index)}
          >
            <span
              className={`${styles.tracklist__cell} ${styles.tracklist__cellOPaque}`}
            >
              {index + 1}{" "}
            </span>
            <div className={styles.tracklist__cell}>
              <div className={styles.track__image}>
                <Image
                  src={
                    track?.album?.images[2]
                      ? track?.album?.images[2].url
                      : "/placeholder.png"
                  }
                  width={36}
                  height={36}
                  layout="responsive"
                  quality="100"
                  className={styles.playlist__image}
                />{" "}
              </div>
              <div className={styles.track__artistContainer}>
                <span className={styles.track__name}>{track.name}</span>
                <span
                  className={`${styles.track__artist} ${styles.tracklist__cellOPaque}`}
                >
                  {track.artists.map((e, i) => {
                    if (
                      i === track.artists.length - 1 ||
                      track.artists.length === 1
                    ) {
                      return (
                        <a
                          className={styles.track__artist__link}
                          href={e.external_urls.spotify}
                        >
                          {e.name}
                        </a>
                      )
                    } else {
                      return (
                        <>
                          <a
                            className={styles.track__artist__link}
                            href={e.external_urls.spotify}
                          >
                            {e.name}
                          </a>
                          , &nbsp;
                        </>
                      )
                    }
                  })}
                </span>
              </div>
            </div>
            <span
              className={`${styles.tracklist__cell} ${styles.tracklist__cellOPaque}`}
            >
              {track.album.name}
            </span>
            <span
              className={`${styles.tracklist__cell} ${styles.tracklist__cellOPaque}`}
            >
              {track.album.name}
            </span>
            <span
              className={`${styles.tracklist__cell} ${styles.tracklist__cellOPaque}`}
              style={{ justifySelf: "end" }}
            >
              {returnTime(track.duration_ms)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default TrackList
