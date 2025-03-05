import { Button } from "@/components/ui/button";

// This will be replaced by 'use cache' soon
export const dynamic = "force-static";

export default async function Home() {
  return (
    <div className="min-h-screen p-8 ">
      <main className="max-w-[350px] mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">
          Quiz App
        </h1>
        <div className="text-center">
          {" "}
          <Button>Create Quiz</Button>
        </div>
      </main>
    </div>
  );
}
