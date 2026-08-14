DROP POLICY IF EXISTS habits_select ON public.habits;
CREATE POLICY habits_select ON public.habits FOR SELECT TO authenticated
USING (
  is_admin()
  OR created_by = auth.uid()
  OR EXISTS (SELECT 1 FROM public.habit_assignments a WHERE a.habit_id = habits.id AND a.user_id = auth.uid())
);

CREATE POLICY habits_insert_own ON public.habits FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY habits_update_own ON public.habits FOR UPDATE TO authenticated
USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY habits_delete_own ON public.habits FOR DELETE TO authenticated
USING (created_by = auth.uid());

CREATE POLICY habit_assignments_insert_own ON public.habit_assignments FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.habits h WHERE h.id = habit_id AND h.created_by = auth.uid())
);

CREATE POLICY habit_assignments_delete_own ON public.habit_assignments FOR DELETE TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.habits h WHERE h.id = habit_id AND h.created_by = auth.uid())
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.habit_assignments TO authenticated;