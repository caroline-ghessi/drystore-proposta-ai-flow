-- Criar cron job para limpeza automática dos arquivos de treinamento
-- Executa diariamente às 2:00 AM
SELECT cron.schedule(
  'cleanup-treinamento-files',
  '0 2 * * *', -- Todos os dias às 2:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://xjmuxtoichwikoquishz.supabase.co/functions/v1/cleanup-treinamento-files',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbXV4dG9pY2h3aWtvcXVpc2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTQxMzcsImV4cCI6MjA2NzgzMDEzN30.mPYN1QeAi59Ze1H2SeGxrSWzK4mTtS44XMtQqRcPzJA"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);