-- Estende a tabela de perfis existente com os dados de onboarding (nenhuma tabela nova)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS goal text,
  ADD COLUMN IF NOT EXISTS goal_other text,
  ADD COLUMN IF NOT EXISTS current_weight numeric,
  ADD COLUMN IF NOT EXISTS target_weight numeric,
  ADD COLUMN IF NOT EXISTS start_weight numeric,
  ADD COLUMN IF NOT EXISTS height_cm numeric,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS activity_level text,
  ADD COLUMN IF NOT EXISTS training_frequency integer,
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS preferred_activities text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS available_time integer,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- Garante remoção em cascata quando o usuário do Auth é excluído
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Validação de valores razoáveis (via trigger, evitando CHECK sobre dados variáveis)
CREATE OR REPLACE FUNCTION public.validate_profile_measurements()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.current_weight IS NOT NULL AND (NEW.current_weight <= 0 OR NEW.current_weight > 500) THEN
    RAISE EXCEPTION 'peso_atual_invalido';
  END IF;
  IF NEW.target_weight IS NOT NULL AND (NEW.target_weight <= 0 OR NEW.target_weight > 500) THEN
    RAISE EXCEPTION 'peso_meta_invalido';
  END IF;
  IF NEW.height_cm IS NOT NULL AND (NEW.height_cm <= 0 OR NEW.height_cm > 260) THEN
    RAISE EXCEPTION 'altura_invalida';
  END IF;
  IF NEW.training_frequency IS NOT NULL AND (NEW.training_frequency < 0 OR NEW.training_frequency > 7) THEN
    RAISE EXCEPTION 'frequencia_invalida';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_validate_measurements ON public.profiles;
CREATE TRIGGER profiles_validate_measurements
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_measurements();

-- Usuários existentes continuam válidos: onboarding_completed = false por padrão
UPDATE public.profiles SET onboarding_completed = false WHERE onboarding_completed IS NULL;