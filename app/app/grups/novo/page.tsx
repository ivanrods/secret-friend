import NewGrupForm from "@/components/new-group-form";
import { createClient } from "@/utils/supabase/server";

export default async function NewGrupPage() {

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const loggedUser = {
    id: data?.user?.id as string,
    email: data?.user?.email as string,
  };

  return (
    <div className="mt-48">
      <NewGrupForm loggedUser={loggedUser} />
    </div>
  );
}
