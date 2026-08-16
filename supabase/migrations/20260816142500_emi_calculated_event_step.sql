-- Add the emi_calculated step for the new calculate_emi API Function
-- (src/lib/functions/calculate-emi.ts).
alter table automation_events drop constraint automation_events_step_check;

alter table automation_events add constraint automation_events_step_check
  check (step in (
    'lead_created', 'language_detected', 'voice_call_triggered', 'reasoning_pass',
    'pipeline_updated', 'chat_sent', 'follow_up_scheduled', 'escalated', 'emi_calculated'
  ));
