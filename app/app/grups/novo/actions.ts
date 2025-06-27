"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Resend } from "resend";

export type CreateGroupState = {
  success: null | boolean;
  message?: string;
};

export async function createGroup(
  _previousState: CreateGroupState,
  formData: FormData
) {
  const supabase = await createClient();
  const { data: authUser, error: authError } = await supabase.auth.getUser();

  if (authError) {
    return {
      success: false,
      message: "Ocorreu um erro ao criar o grupo",
    };
  }

  const names = formData.getAll("name");
  const emails = formData.getAll("email");
  const groupName = formData.get("group-name") as string;

  const { data: newGroup, error } = await supabase
    .from("groups")
    .insert({
      name: groupName,
      owner_id: authUser?.user.id,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      message: "Ocorreu um erro ao criar o grupo, tente novamente",
    };
  }

  const participants = names.map((name, index) => ({
    group_id: newGroup.id,
    name,
    email: emails[index],
  }));

  const { data: createdParticipants, error: errorParticipants } = await supabase
    .from("participants")
    .insert(participants)
    .select();

  if (errorParticipants) {
    return {
      success: false,
      message: "Ocorreu um erro ao criar os participantes, tente novamente",
    };
  }

  const drawnParticipants = drawnGroup(createdParticipants);

  const { error: errorDraw } = await supabase
    .from("participants")
    .upsert(drawnParticipants);

  if (errorDraw) {
    return {
      success: false,
      message: "Ocorreu um erro ao sortear os participantes, tente novamente",
    };
  }

  const { error: errorResend } = await sendEmailToParticipants(
    drawnParticipants,
    groupName
  );

  if (errorResend) {
    return {
      success: false,
      message: errorResend,
    };
  }

  redirect(`/app/grups/${newGroup.id}`);
}

type Participant = {
  id: string;
  group_id: string;
  name: string;
  email: string;
  assigned_to: string | null;
  created_at: string;
};

function drawnGroup(participants: Participant[]) {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);

  return shuffled.map((participant, index) => {
    const assignedIndex = (index + 1) % shuffled.length;
    return {
      ...participant,
      assigned_to: shuffled[assignedIndex].id,
    };
  });
}

async function sendEmailToParticipants(
  participants: Participant[],
  groupName: string
) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await Promise.all(
      participants.map((participant) => {
        return resend.emails.send({
          from: "send@codante.io",
          to: participant.email,
          subject: `Sorteio de amigo secreto - ${groupName}`,
          html: `<p>Você está participando do amigo secreto do grupo <strong>${groupName}</strong>. <br /><br />
          O seu amigo secreto é <strong>${
            participants.find((p) => p.id === participant.assigned_to)?.name
          }</strong></p>`,
        });
      })
    );

    return { error: null };
  } catch {
    return { error: "Ocorreu um erro ao enviar os emails." };
  }
}
