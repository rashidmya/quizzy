import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, Loader2 } from "lucide-react";
import QuizNewEditSettingsDialog from "./quiz-new-edit-settings-dialog";

type Props = {
  onBack: () => void;
  title: string;
  isPending: boolean;
  upsertState: {
    message: string;
  };
};
export default function QuizNewEditHeader({
  onBack,
  title,
  isPending,
  upsertState,
}: Props) {
  return (
    <div className="border-b p-4">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-row gap-8">
          <Button
            type="button"
            variant="outline"
            className="shadow-none"
            onClick={onBack}
          >
            <ChevronLeftIcon />
          </Button>
          <p className="text-2xl font-bold">{title}</p>
        </div>

        <div className="flex gap-2">
          <QuizNewEditSettingsDialog />
          <Button type="submit">
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        </div>
      </div>
      <div className="flex justify-end w-full pt-2">
        {upsertState.message && (
          <p className="text-sm text-gray-400">{upsertState.message}</p>
        )}
      </div>
    </div>
  );
}
