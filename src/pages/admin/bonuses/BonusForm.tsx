import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateBonus, useUpdateBonus } from "../../../hooks/useBonuses";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["FIRST_DEPOSIT","RELOAD","CASHBACK","FREEBET"]),
  amount_type: z.enum(["percent","fixed"]),
  amount_value: z.coerce.number().min(0),
  max_cap: z.coerce.number().min(0).nullable().optional(),
  min_deposit: z.coerce.number().min(0).nullable().optional(),
  rollover_multiplier: z.coerce.number().min(0),
  auto_grant: z.coerce.boolean().default(false),
  requires_code: z.coerce.boolean().default(false),
  code: z.string().optional().nullable(),
  valid_from: z.string(),
  valid_to: z.string(),
  max_per_user: z.coerce.number().min(0).nullable().optional(),
  cooldown_hours: z.coerce.number().min(0).nullable().optional(),
  is_active: z.coerce.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

export default function BonusForm() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const createM = useCreateBonus();
  const updateM = useUpdateBonus();

  const { data: existing } = useQuery({
    enabled: Boolean(id),
    queryKey: ["admin","bonuses", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("bonuses_new").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // set default values when existing loaded
  React.useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description,
        type: existing.type as "FIRST_DEPOSIT" | "RELOAD" | "CASHBACK" | "FREEBET",
        amount_type: existing.amount_type as "percent" | "fixed",
        amount_value: existing.amount_value,
        max_cap: existing.max_cap,
        min_deposit: existing.min_deposit,
        rollover_multiplier: existing.rollover_multiplier,
        auto_grant: existing.auto_grant,
        requires_code: existing.requires_code,
        code: existing.code,
        valid_from: existing.valid_from,
        valid_to: existing.valid_to,
        max_per_user: existing.max_per_user,
        cooldown_hours: existing.cooldown_hours,
        is_active: existing.is_active
      });
    }
  }, [existing, reset]);

  const onSubmit = async (values: FormValues) => {
    if (id) {
      await updateM.mutateAsync({ id, ...values });
    } else {
      await createM.mutateAsync(values);
    }
    navigate("/admin/bonuses/list");
  };

  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold">{id ? "Edit Bonus" : "New Bonus"}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span>Name</span>
          <input className="rounded bg-slate-900 p-2" {...register("name")} />
          {errors.name && <span className="text-xs text-red-400">{errors.name.message as string}</span>}
        </label>
        <label className="flex flex-col gap-1">
          <span>Type</span>
          <select className="rounded bg-slate-900 p-2" {...register("type")}>
            <option value="FIRST_DEPOSIT">FIRST_DEPOSIT</option>
            <option value="RELOAD">RELOAD</option>
            <option value="CASHBACK">CASHBACK</option>
            <option value="FREEBET">FREEBET</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span>Amount Type</span>
          <select className="rounded bg-slate-900 p-2" {...register("amount_type")}> 
            <option value="percent">percent</option>
            <option value="fixed">fixed</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span>Amount Value</span>
          <input type="number" step="0.01" className="rounded bg-slate-900 p-2" {...register("amount_value", { valueAsNumber: true })} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Max Cap</span>
          <input type="number" step="0.01" className="rounded bg-slate-900 p-2" {...register("max_cap", { valueAsNumber: true })} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Min Deposit</span>
          <input type="number" step="0.01" className="rounded bg-slate-900 p-2" {...register("min_deposit", { valueAsNumber: true })} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Rollover Multiplier</span>
          <input type="number" step="0.1" className="rounded bg-slate-900 p-2" {...register("rollover_multiplier", { valueAsNumber: true })} />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("auto_grant")} /> <span>Auto Grant</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("requires_code")} /> <span>Requires Code</span>
        </label>
        <label className="flex flex-col gap-1 md:col-span-2">
          <span>Code (optional)</span>
          <input className="rounded bg-slate-900 p-2" {...register("code")} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Valid From</span>
          <input type="datetime-local" className="rounded bg-slate-900 p-2" {...register("valid_from")} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Valid To</span>
          <input type="datetime-local" className="rounded bg-slate-900 p-2" {...register("valid_to")} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Max Per User</span>
          <input type="number" className="rounded bg-slate-900 p-2" {...register("max_per_user", { valueAsNumber: true })} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Cooldown (hours)</span>
          <input type="number" className="rounded bg-slate-900 p-2" {...register("cooldown_hours", { valueAsNumber: true })} />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("is_active")} /> <span>Active</span>
        </label>
        <div className="md:col-span-2 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="rounded border border-slate-700 px-4 py-2">Cancel</button>
          <button type="submit" className="rounded bg-cyan-500 px-4 py-2 text-slate-900">Save</button>
        </div>
      </form>
    </div>
  );
}