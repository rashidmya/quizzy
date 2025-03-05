"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Quiz } from "@/lib/queries/quizzes";

// Define a schema for a single field.
const fieldSchema = z.object({
  value: z.string().min(1, { message: "Field is required" }),
});

// Define the form schema as an array of fields.
const formSchema = z.object({
  fields: z
    .array(fieldSchema)
    .min(1, { message: "At least one field is required" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function QuizEdit({ quiz }: { quiz: Quiz }) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { fields: [{ value: "" }] },
  });

  // useFieldArray helps us dynamically add/remove fields.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const onSubmit = (data: FormValues) => {
    console.log("Submitted data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input ></Input>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2">
          <Label htmlFor={`fields.${index}.value`} className="sr-only">
            Field {index + 1}
          </Label>
          <Input
            id={`fields.${index}.value`}
            type="text"
            placeholder={`Field ${index + 1}`}
            {...register(`fields.${index}.value` as const)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="destructive"
            onClick={() => remove(index)}
          >
            Remove
          </Button>
        </div>
      ))}
      {errors.fields && (
        <p className="text-red-500 text-sm">
          {Array.isArray(errors.fields)
            ? errors.fields.map(
                (err, idx) =>
                  err?.value?.message && (
                    <span key={idx}>{err.value.message} </span>
                  )
              )
            : errors.fields.message}
        </p>
      )}
      <div className="flex flex-col space-y-2">
        <Button type="button" onClick={() => append({ value: "" })}>
          Add Field
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
