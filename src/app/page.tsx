import Tabs from "@/components/tabs";
import dbConnect from "../../lib/dbConnect";


export default async function Home() {

  await dbConnect();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Tabs />
    </main>
  );
}