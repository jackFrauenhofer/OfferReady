alter table public.profiles
  add column if not exists weekly_mock_interviews_goal integer default 3;
