"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DashboardPage() {
  return (
    <div className="gap-2 flex-row mx-auto flex">
      <Button color="success" onClick={() => toast.success("hello")}>success</Button>
      <Button onClick={() => toast.warning("hello")}>warning</Button>
      <Button onClick={() => toast.info("hello")}>info</Button>
      <Button onClick={() => toast.error("hello")}>error</Button>
    </div>
  );
}
