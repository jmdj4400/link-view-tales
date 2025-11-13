-- Function to assign admin role to a specific email
CREATE OR REPLACE FUNCTION assign_admin_by_email(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_email;
  END IF;
  
  -- Insert admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Admin role assigned to user %', p_email;
END;
$$;

-- Create database trigger to send email notifications when article is published
CREATE OR REPLACE FUNCTION notify_new_article()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_id bigint;
BEGIN
  -- Only trigger when article becomes published (not already published)
  IF NEW.published = true AND (OLD.published IS NULL OR OLD.published = false) THEN
    -- Call edge function to send notifications (non-blocking)
    BEGIN
      SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/notify-article-published',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
        ),
        body := jsonb_build_object(
          'article_id', NEW.id,
          'article_title', NEW.title,
          'article_slug', NEW.slug,
          'author_name', NEW.author_name
        )
      ) INTO v_request_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to send article notification: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on articles table
DROP TRIGGER IF EXISTS on_article_published ON public.articles;
CREATE TRIGGER on_article_published
  AFTER INSERT OR UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_article();