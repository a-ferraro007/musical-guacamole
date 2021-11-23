import Head from "next/head"
import { useRouter } from "next/router"
import styles from "../styles/Home.module.css"
import { useAuth } from "../context/auth"

export default function Login() {
  const router = useRouter()
  const { authorizationCode } = useAuth()

  return (
    <>
      <div className={styles.container}>
        <Head>
          <title>Create Next App</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <button onClick={async () => await authorizationCode(router)}>
            {" "}
            Log In{" "}
          </button>
        </main>
      </div>
    </>
  )
}
