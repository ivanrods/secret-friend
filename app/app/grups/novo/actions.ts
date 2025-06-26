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
      message: "Ocorreu um erro as criar o grupo",
    };
  }

  const names = formData.getAll("name");
  const emails = formData.getAll("email");
  const groupName = formData.getAll("group-name");

  const { data: newGrups, error } = await supabase
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
      message: "Ocorreu um erro as criar o grupo, tente novamente",
    };
  }

  const participants = names.map((name, index) => ({
    group_id: newGrups.id,
    name,
    email: emails[index],
  }));
  const { data: createParticipants, error: errorParticipants } = await supabase
    .from("participants")
    .insert(participants)
    .select();

  if (errorParticipants) {
    return {
      success: false,
      message: "Ocorreu um erro as criar o participantes, tente novamente",
    };
  }

  const drawnParticipants = drawnGroup(createParticipants);

  const { error: errorDraw } = await supabase
    .from("participants")
    .upsert(drawnParticipants);

  if (errorDraw) {
    return {
      success: false,
      message: "Ocorreu um erro as sortear os participantes, tente novamente",
    };
  }
  const { error: errorResend } = await sendEmailToParticipants(
    drewnParticipants,
    groupName as string
  );

  if (errorResend) {
    return {
      success: false,
      message: errorResend,
    };
  }
  redirect(`app/groups/${newGrups.id}`)
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
  const selectedParticipants: string[] = [];

  return participants.map((participant) => {
    const avalibleParticipants = participants.filter(
      (p) => p.id !== participant.id && !selectedParticipants.includes(p.id)
    );

    const assignedParticipant =
      avalibleParticipants[
        Math.floor(Math.random() * avalibleParticipants.length)
      ];
    selectedParticipants.push(assignedParticipant.id);

    return {
      ...participant,
      assigned_to: assignedParticipant.id,
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
        resend.emails.send({
          from: "send@codante.io",
          to: participant.email,
          subject: `Sorteio de amigo secreto - ${groupName}`,
          html: `<p>Você está participando do amigo secreto do grupo <strong>${groupName}</strong>. <br /> <br />
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
