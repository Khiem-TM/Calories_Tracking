import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { WorkoutSessionForm } from "./WorkoutSessionForm";
import { useExercises } from "../hooks/useExercises";
import type { Exercise, MuscleGroup } from "@/types";
import { clsx } from "clsx";

interface ExerciseSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "cardio",
  "full_body",
];

function ExerciseRow({
  ex,
  onSelect,
}: {
  ex: Exercise;
  onSelect: (e: Exercise) => void;
}) {
  return (
    <button
      key={ex.id}
      onClick={() => onSelect(ex)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left transition-colors"
    >
      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
        {ex.imageUrl ? (
          <img
            src={ex.imageUrl}
            alt={ex.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            className="h-5 w-5 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700">{ex.name}</p>
        <p className="text-xs text-slate-400 capitalize">
          {ex.primaryMuscleGroup.replace("_", " ")} · {ex.intensity}
        </p>
        {ex.description && (
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {ex.description}
          </p>
        )}
      </div>

      {/* MET badge */}
      <span className="text-xs text-slate-500 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full font-manrope">
        MET {ex.metValue}
      </span>
    </button>
  );
}

export function ExerciseSearchModal({
  open,
  onClose,
}: ExerciseSearchModalProps) {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | undefined>();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  const { data: exercises = [], isLoading } = useExercises({
    name: search || undefined,
    muscleGroup: selectedGroup,
  });

  const handleClose = () => {
    setSearch("");
    setSelectedGroup(undefined);
    setSelectedExercise(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={selectedExercise ? "Log Workout" : "Choose Exercise"}
      size="lg"
    >
      {selectedExercise ? (
        <WorkoutSessionForm
          exercise={selectedExercise}
          onBack={() => setSelectedExercise(null)}
          onSuccess={handleClose}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          {/* Muscle group filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {MUSCLE_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() =>
                  setSelectedGroup(selectedGroup === g ? undefined : g)
                }
                className={clsx(
                  "px-2.5 py-1 rounded-full text-xs font-medium transition-colors capitalize",
                  selectedGroup === g
                    ? "bg-primary text-on-primary"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {g.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="max-h-72 overflow-y-auto -mx-2 px-2">
            {isLoading && (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            )}
            {!isLoading &&
              exercises.map((ex) => (
                <ExerciseRow
                  key={ex.id}
                  ex={ex}
                  onSelect={setSelectedExercise}
                />
              ))}
            {!isLoading && exercises.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-6">
                No exercises found
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
