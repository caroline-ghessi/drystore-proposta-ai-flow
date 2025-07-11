-- Agendar limpeza automática de arquivos debug (executa diariamente à meia-noite)
SELECT cron.schedule(
  'cleanup-debug-files-daily',
  '0 0 * * *', -- Todo dia à meia-noite
  $$
  SELECT
    net.http_post(
        url:='https://xjmuxtoichwikoquishz.supabase.co/functions/v1/cleanup-debug-files',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbXV4dG9pY2h3aWtvcXVpc2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTQxMzcsImV4cCI6MjA2NzgzMDEzN30.mPYN1QeAi59Ze1H2SeGxrSWzK4mTtS44XMtQqRcPzJA"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);