import Head from "next/head";
import { useState } from "react";
import { getSession, SessionProvider, useSession } from "next-auth/react";
import { leagueList } from "./api/league";
import Link from "next/link";
import Menu from "../components/Menu";
import { push } from "@socialgouv/matomo-next";
import connect from "../Modules/database.mjs";
// Used to create a new League
function MakeLeague({ getLeagueData }) {
  const [leagueName, setLeagueName] = useState("");
  const [startingMoney, setStartingMoney] = useState(150);
  return (
    <>
      <h2>Create League</h2>
      <label htmlFor="startingMoney">
        Money players will start with in millions:
      </label>
      <input
        id="startingMoney"
        value={startingMoney}
        type="number"
        onChange={(val) => {
          setStartingMoney(val.target.value);
        }}
      ></input>
      <br></br>
      <label htmlFor="name">League name:</label>
      <input
        id="name"
        value={leagueName}
        onChange={(val) => {
          setLeagueName(val.target.value);
        }}
      ></input>
      <br></br>
      <button
        onClick={async () => {
          push(["trackEvent", "League", "Create", leagueName]);
          // Used to create a league
          await fetch("/api/league", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: leagueName,
              "Starting Money": startingMoney * 1000000,
            }),
          });
          getLeagueData();
        }}
      >
        Create League
      </button>
    </>
  );
}
// Used to leave a league
function LeaveLeague({ leagueID, getLeagueData }) {
  return (
    <button
      id={leagueID}
      onClick={async (e) => {
        push(["trackEvent", "League", "Leave", leagueID]);
        await fetch(`/api/league/${leagueID}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        getLeagueData();
      }}
      className="red-button"
    >
      Leave League
    </button>
  );
}
// Used to list all the leagues you are part of and to add a league
function Leagues({ leagueData }) {
  const { data: session } = useSession();
  const [legueList, setLeagueList] = useState(leagueData);
  if (session) {
    // Used to get a list of all the leagues
    const getLeagueData = async () => {
      let data = await fetch("/api/league");
      setLeagueList(await data.json());
    };
    return (
      <>
        <h1>Leagues</h1>
        {legueList.map((val) => (
          // Makes a link for every league
          <div key={val.leagueID}>
            <Link href={`/${val.leagueID}`}>{val.leagueName}</Link>
            <LeaveLeague
              leagueID={val.leagueID}
              getLeagueData={getLeagueData}
            />
          </div>
        ))}
        <MakeLeague getLeagueData={getLeagueData} />
      </>
    );
  } else {
    return <></>;
  }
}
export default function Home({ session, leagueData, versionData }) {
  return (
    <>
      <Head>
        <title>Bundesliga Fantasy</title>
      </Head>
      <Menu session={session} />
      <h1>Bundesliga Fantasy Manager</h1>
      <SessionProvider session={session}>
        <Leagues leagueData={leagueData} />
      </SessionProvider>
      {versionData !== null && (
        <div className={"notification"}>
          <a href={versionData} rel="noreferrer" target="_blank">
            New Update for more info Click Here
          </a>
        </div>
      )}
    </>
  );
}

export async function getServerSideProps(ctx) {
  const connection = await connect();
  const versionData = await connection
    .query("SELECT value2 FROM data WHERE value1='updateProgram'")
    .then((result) => (result.length === 0 ? null : result[0].value2));
  connection.end();
  const session = getSession(ctx);
  if (await session) {
    return {
      props: {
        versionData: await versionData,
        leagueData: JSON.parse(
          JSON.stringify(await leagueList((await session).user.id))
        ),
      },
    };
  } else {
    return { props: { versionData: await versionData, leagueData: [] } };
  }
}
