"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader, Mail, Trash2 } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { createGroup, CreateGroupState } from "@/app/app/grups/novo/actions";
import { toast } from "sonner";
interface Participant {
  name: string;
  email: string;
}
export default function NewGrupForm({
  loggedUser,
}: {
  loggedUser: { email: string; id: string };
}) {
  const [participants, setParticipants] = useState<Participant[]>([
    { name: "", email: loggedUser.email },
  ]);
  const [grupName, setGrupName] = useState("");

  const [state, formAction, pending] = useActionState<
    CreateGroupState,
    FormData
  >(createGroup, {
    success: null,
    message: "",
  });

  function updateParticipant(
    index: number,
    field: keyof Participant,
    value: string
  ) {
    const updatedParticipants = [...participants];
    updatedParticipants[index][field] = value;
    setParticipants(updatedParticipants);
  }

  function removeParticipant(index: number) {
    setParticipants(participants.filter((_, i) => i !== index));
  }
  function addParticipant() {
    setParticipants(participants.concat({ name: "", email: "" }));
  }

  useEffect(() => {
    if (state.success === false) {
      toast("Event has been created.");
    }
  }, [state]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Novo grupo</CardTitle>
        <CardDescription>Convide seus amigos para participar</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="group-name">Nome do grupo</label>
            <Input
              id="group-name"
              name="group-name"
              value={grupName}
              onChange={(e) => setGrupName(e.target.value)}
              placeholder="Digite o nome do grupo"
              required
            />
          </div>
          <h2 className="!mt-2">Participantes</h2>
          {participants.map((participant, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-end space-y-4 md:space-y0 md:space-x-4"
            >
              <div className="flex-row space-y-2 w-full">
                <label htmlFor={`name-${index}`}>Nome</label>
                <Input
                  id={`name-${index}`}
                  name="name"
                  value={participant.name}
                  onChange={(e) => {
                    updateParticipant(index, "name", e.target.value);
                  }}
                  placeholder="Digite o nome da pessoa"
                  required
                />
              </div>

              <div className="flex-row space-y-2 w-full">
                <label htmlFor={`email-${index}`}>Email</label>
                <Input
                  id={`email-${index}`}
                  name="email"
                  type="email"
                  value={participant.email}
                  onChange={(e) => {
                    updateParticipant(index, "email", e.target.value);
                  }}
                  placeholder="Digite o email da pessoa"
                  className="read-only:text-muted-foreground"
                  readOnly={participant.email === loggedUser.email}
                  required
                />
              </div>

              <div className="">
                {participants.length > 1 &&
                  participant.email !== loggedUser.email && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeParticipant(index)}
                    >
                      <Trash2 className="h4 w-4" />
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </CardContent>
        <Separator className="my-4" />
        <CardFooter className="flex flex-col md:flex-row justify-between space-y4 md:space-y-0">
          <Button
            type="button"
            variant="outline"
            onClick={addParticipant}
            className="w-full md:w-auto"
          >
            Adicionar amigo
          </Button>

          <Button
            type="submit"
            className="flex items-center space-x-2 w-full md:w-auto"
          >
            <Mail className="w-3 h-3" />
            Criar grupos e enviar emails
            {pending && <Loader className="animate-spin" />}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
