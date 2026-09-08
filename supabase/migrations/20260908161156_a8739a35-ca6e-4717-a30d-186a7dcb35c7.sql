SELECT cron.unschedule('notify-plan-expiry');

SELECT cron.schedule(
  'notify-plan-expiry',
  '0 9 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://project--cfdbbb9a-edd7-452e-9fc4-bae47d567950.lovable.app/api/public/hooks/plan-expiry',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key'
      )
    ),
    body := '{}'::jsonb
  );
  $cron$
);