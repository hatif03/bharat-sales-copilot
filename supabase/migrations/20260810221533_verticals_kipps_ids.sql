-- Links a vertical to the Kipps.AI Chatbot + Voicebot provisioned for it.
alter table verticals
  add column kipps_chatbot_id uuid,
  add column kipps_voicebot_id uuid;
