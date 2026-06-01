CREATE OR REPLACE FUNCTION public.register_absence_with_free_day(
  p_user_id      uuid,
  p_absence_date date,
  p_free_day_id  uuid,
  p_notes        text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE hr_free_days
    SET status = 'deducted', used_at = p_absence_date
  WHERE id = p_free_day_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Dia livre inválido ou não pertence ao funcionário';
  END IF;

  INSERT INTO hr_absences(user_id, absence_date, type, free_day_id, notes)
  VALUES (p_user_id, p_absence_date, 'deduct_free_day', p_free_day_id, p_notes);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.register_absence_with_free_day(uuid,date,uuid,text)
  FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_absence_with_free_day(uuid,date,uuid,text)
  TO service_role;
