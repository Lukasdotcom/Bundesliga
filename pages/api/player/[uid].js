import connect from "../../../Modules/database.mjs";
import { checkUpdate } from "../../../scripts/update.mjs";
// Used to return a dictionary on the data for a player
export default async function handler(req, res) {
  if (req.method == "GET") {
    const connection = await connect();
    // Checks if new data needs to be requested
    checkUpdate();
    const result = await connection.query(
      `SELECT * FROM players WHERE uid=? LIMIT 1`,
      [req.query.uid]
    );
    // Checks if the player exists
    if (result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).end("Player not found");
    }
    connection.end();
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
