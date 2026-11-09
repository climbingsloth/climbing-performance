import { connection } from "next/server";
import AthletesClient from "./athletes-client";

export default async function AthletesPage() {
  await connection();
  return <AthletesClient today={new Date().toISOString().slice(0, 10)} />;
}
