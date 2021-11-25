import React from "react"
import Header from "./Header"
import styles from "../styles/Layout.module.css"
//import { Head } from "next/document"

const Layout = ({ children }) => {
  return (
    <>
      {/*<Head>
        {" "}
        <title>Musical Gaucamole</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>*/}
      <Header />
      <main className={styles.content__container}>{children}</main>
    </>
  )
}

export default Layout
